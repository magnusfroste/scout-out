
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
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
    <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-6 font-bold text-2xl">
          <Link to="/" className="hover:text-primary transition-colors">
            Master Business Agent
          </Link>
        </div>
        
        {/* Main navigation links */}
        <div className="hidden md:flex items-center space-x-4">
          <Link to="/features" className="text-sm font-medium px-4 py-2 rounded-md hover:bg-accent">
            Features
          </Link>
          <Link to="/pricing" className="text-sm font-medium px-4 py-2 rounded-md hover:bg-accent">
            Pricing
          </Link>
          <Link to="/about" className="text-sm font-medium px-4 py-2 rounded-md hover:bg-accent">
            About
          </Link>
        </div>
        
        {/* Right side navigation */}
        <div className="flex items-center gap-4 ml-auto">
          {user ? (
            <>
              <Link to="/dashboard" className="text-sm font-medium px-4 py-2 rounded-md hover:bg-accent">
                Dashboard
              </Link>
              {userProfile?.is_admin && (
                <Link to="/settings" className="text-sm font-medium px-4 py-2 rounded-md hover:bg-accent">
                  Settings
                </Link>
              )}
              <Link to="/profile" className="text-sm font-medium px-4 py-2 rounded-md hover:bg-accent">
                Profile
              </Link>
              
              <Avatar className="h-8 w-8 border">
                {userProfile?.avatar_url ? (
                  <AvatarImage src={userProfile.avatar_url} alt={userProfile?.first_name || 'User'} />
                ) : (
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                )}
              </Avatar>
              
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </>
          ) : (
            <Button onClick={() => navigate('/auth')}>
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
