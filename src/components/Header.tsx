
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';

const Header = () => {
  const { user, userProfile, signOut } = useAuth();
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth', { replace: true });
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error signing out",
        description: "There was a problem signing you out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getInitials = () => {
    if (!userProfile?.first_name) return 'U';
    
    const firstName = userProfile.first_name || '';
    const lastName = userProfile.last_name || '';
    
    return ((firstName[0] || '') + (lastName[0] || ''))
      .toUpperCase()
      .substring(0, 2) || 'U';
  };
  
  return (
    <header className="w-full border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold">
            <a href="/" className="hover:text-primary transition-colors">
              Master Business Agent
            </a>
          </h1>
          
          <nav className="hidden md:flex ml-10">
            <ul className="flex space-x-8">
              <li>
                <a href="/features" className="text-sm font-medium hover:text-primary">
                  Features
                </a>
              </li>
              <li>
                <a href="/pricing" className="text-sm font-medium hover:text-primary">
                  Pricing
                </a>
              </li>
              <li>
                <a href="/about" className="text-sm font-medium hover:text-primary">
                  About
                </a>
              </li>
            </ul>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <a href="/dashboard" className="text-sm font-medium hover:text-primary">
                Dashboard
              </a>
              {userProfile?.is_admin && (
                <a href="/settings" className="text-sm font-medium hover:text-primary">
                  Settings
                </a>
              )}
              <a href="/profile" className="text-sm font-medium hover:text-primary">
                Profile
              </a>
              
              <Avatar className="h-8 w-8 border">
                {userProfile?.avatar_url ? (
                  <AvatarImage src={userProfile.avatar_url} alt={userProfile?.first_name || 'User'} />
                ) : (
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                )}
              </Avatar>
              
              <button 
                onClick={handleSignOut}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                Sign Out
              </button>
            </>
          ) : (
            <a 
              href="/auth"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90"
            >
              Sign In
            </a>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
