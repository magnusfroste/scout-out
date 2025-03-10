
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

const Navigation = () => {
  const { user, userProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  
  const handleSignOut = async () => {
    try {
      console.log('Navigation: Handling sign out...');
      await signOut();
      console.log('Navigation: Sign out successful, navigating...');
      
      // Force navigation to auth page
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
  
  const handleSignIn = () => {
    navigate('/auth');
  };
  
  return (
    <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-14 items-center">
        <div className="mr-6 font-bold text-2xl">
          <Link to="/" className="hover:text-primary transition-colors">
            Master Business Agent
          </Link>
        </div>
        
        {/* Always show navigation links on landing page */}
        {(isLandingPage || !user) && (
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/features" className="text-sm font-medium hover:text-primary transition-colors px-3 py-2">
              Features
            </Link>
            <Link to="/pricing" className="text-sm font-medium hover:text-primary transition-colors px-3 py-2">
              Pricing
            </Link>
            <Link to="/about" className="text-sm font-medium hover:text-primary transition-colors px-3 py-2">
              About
            </Link>
          </div>
        )}
        
        <div className="flex items-center gap-4 ml-auto">
          {user ? (
            <>
              <Link to="/dashboard" className="text-sm font-medium hover:text-primary transition-colors px-3 py-2">
                Dashboard
              </Link>
              {userProfile?.is_admin && (
                <Link to="/settings" className="text-sm font-medium hover:text-primary transition-colors px-3 py-2">
                  Settings
                </Link>
              )}
              <Link to="/profile" className="text-sm font-medium hover:text-primary transition-colors px-3 py-2">
                Profile
              </Link>
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </>
          ) : (
            <Button onClick={handleSignIn}>
              Sign In
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navigation;
