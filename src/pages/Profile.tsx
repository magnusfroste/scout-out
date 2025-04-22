import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { User, Mail, CreditCard, RefreshCw, Save, Edit, X } from 'lucide-react';
import CreditDisplay from '@/components/dashboard/CreditDisplay';
import { Input } from '@/components/ui/input';
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileDetails from "@/components/profile/ProfileDetails";
import CreditSection from "@/components/profile/CreditSection";
import PaymentOptions from "@/components/profile/PaymentOptions";
import TransactionHistory from "@/components/profile/TransactionHistory";

const Profile = () => {
  const { user, loading, userProfile, refreshUserProfile, updateProfile } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && !userProfile) {
      refreshUserProfile();
    }
  }, [user, userProfile, refreshUserProfile]);

  useEffect(() => {
    if (userProfile) {
      setFirstName(userProfile.first_name || '');
      setLastName(userProfile.last_name || '');
    }
  }, [userProfile]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshUserProfile();
      toast({
        title: "Profile Refreshed",
        description: "Your profile has been refreshed successfully.",
      });
    } catch (error) {
      console.error('Error refreshing profile:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (userProfile) {
      setFirstName(userProfile.first_name || '');
      setLastName(userProfile.last_name || '');
    }
  };

  const handleSave = async () => {
    if (!userProfile) return;
    
    setIsSaving(true);
    try {
      const success = await updateProfile({
        first_name: firstName,
        last_name: lastName
      });
      
      if (success) {
        setIsEditing(false);
        toast({
          title: "Profile Updated",
          description: "Your name has been updated successfully.",
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: "Could not update your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreditTopUp = async (priceId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: JSON.stringify({ priceId }),
      });

      if (error) throw error;
      
      window.location.href = data.url;
    } catch (error) {
      console.error('Error initiating payment:', error);
      toast({
        title: "Payment Error",
        description: "Could not initiate payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const { data: transactionData, error } = await supabase
        .from('credit_transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(transactionData || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  useEffect(() => {
    fetchTransactions();

    const urlParams = new URLSearchParams(window.location.search);
    const paymentSuccess = urlParams.get('payment_success');
    const paymentCancelled = urlParams.get('payment_cancelled');

    if (paymentSuccess) {
      toast({
        title: "Payment Successful",
        description: "Credits have been added to your account.",
      });
    }

    if (paymentCancelled) {
      toast({
        title: "Payment Cancelled",
        description: "Your payment was cancelled.",
        variant: "default"
      });
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation />
        <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
          <div className="flex justify-center items-center h-full">
            <div className="animate-pulse text-muted-foreground">Loading profile...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-3xl mx-auto space-y-6">
          <ProfileHeader
            isEditing={isEditing}
            isRefreshing={isRefreshing}
            loading={loading}
            isSaving={isSaving}
            onRefresh={handleRefresh}
            onEdit={handleEdit}
            onCancel={handleCancel}
            onSave={handleSave}
          />
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-pulse text-muted-foreground">Loading profile...</div>
            </div>
          ) : !userProfile ? (
            <div className="text-center space-y-4 p-8">
              <div className="text-muted-foreground">Could not load your profile.</div>
              <Button onClick={refreshUserProfile}>Try Again</Button>
            </div>
          ) : (
            <div className="space-y-6">
              <ProfileDetails
                user={user}
                userProfile={userProfile}
                isEditing={isEditing}
                firstName={firstName}
                lastName={lastName}
                setFirstName={setFirstName}
                setLastName={setLastName}
              />
              <CreditSection
                credits={userProfile.credits}
              />
              <PaymentOptions
                isLoading={isLoading}
                onTopUp={handleCreditTopUp}
              />
              <TransactionHistory
                transactions={transactions}
              />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
