
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';  // Add this import
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
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Your Profile</h1>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh} 
              disabled={isRefreshing || loading}
            >
              {isRefreshing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </>
              )}
            </Button>
          </div>
          
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
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle>Account Information</CardTitle>
                  {!isEditing ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleEdit}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleCancel}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm" 
                        onClick={handleSave}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-6 pt-4">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Email</Label>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{user?.email}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Name</Label>
                    {!isEditing ? (
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>
                          {userProfile.first_name || userProfile.last_name 
                            ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim()
                            : 'Not provided'}
                        </span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                          <Label htmlFor="first-name">First Name</Label>
                          <Input
                            id="first-name"
                            placeholder="First Name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="last-name">Last Name</Label>
                          <Input
                            id="last-name"
                            placeholder="Last Name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Credits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center md:flex-row md:justify-between space-y-4 md:space-y-0">
                    <div className="flex items-center space-x-3">
                      <CreditDisplay credits={userProfile.credits} size="lg" />
                      <span className="text-sm text-muted-foreground">Available for searches</span>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      <ul className="list-disc pl-5 space-y-1">
                        <li>1 credit = 10 questions per search</li>
                        <li>Unused credits never expire</li>
                        <li>New accounts start with 5 credits</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Up Credits</CardTitle>
                </CardHeader>
                <CardContent className="flex gap-4">
                  <div className="flex flex-col items-center p-4 border rounded">
                    <p>5 Credits</p>
                    <Button 
                      onClick={() => handleCreditTopUp('price_1O5d4tCNxMPkgjWvAMHzPP5I')}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Processing...' : 'Buy 5 Credits - €5'}
                    </Button>
                  </div>
                  <div className="flex flex-col items-center p-4 border rounded">
                    <p>25 Credits</p>
                    <Button 
                      onClick={() => handleCreditTopUp('price_1O5d57CNxMPkgjWvv7oB4G7G')}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Processing...' : 'Buy 25 Credits - €20'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell>{transaction.amount} credits</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;
