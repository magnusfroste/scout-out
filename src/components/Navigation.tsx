
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Navigation = () => {
  const { user, userProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Pages where we always want to show main navigation links
  const isPublicPage = ['/', '/features', '/pricing', '/about'].includes(location.pathname);
  
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

  const getInitials = () => {
    if (!userProfile?.full_name) return 'U';
    return userProfile.full_name.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-6 font-bold text-2xl">
          <Link to="/" className="hover:text-primary transition-colors">
            Master Business Agent
          </Link>
        </div>
        
        {/* Show main navigation on public pages or when logged out */}
        {(isPublicPage || !user) && (
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link to="/features" className="text-sm font-medium">
                Features
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/pricing" className="text-sm font-medium">
                Pricing
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/about" className="text-sm font-medium">
                About
              </Link>
            </Button>
          </div>
        )}
        
        {/* Right side navigation */}
        <div className="flex items-center gap-4 ml-auto">
          {user ? (
            <>
              {/* Show dashboard link on non-dashboard pages */}
              {location.pathname !== '/dashboard' && (
                <Button variant="ghost" asChild>
                  <Link to="/dashboard" className="text-sm font-medium">
                    Dashboard
                  </Link>
                </Button>
              )}
              {/* Show admin settings only for admins */}
              {userProfile?.is_admin && (
                <Button variant="ghost" asChild>
                  <Link to="/settings" className="text-sm font-medium">
                    Settings
                  </Link>
                </Button>
              )}
              {/* Show profile link on non-profile pages */}
              {location.pathname !== '/profile' && (
                <Button variant="ghost" asChild>
                  <Link to="/profile" className="text-sm font-medium">
                    Profile
                  </Link>
                </Button>
              )}
              
              <Avatar className="h-8 w-8 border">
                {userProfile?.avatar_url ? (
                  <AvatarImage src={userProfile.avatar_url} alt={userProfile.full_name || 'User'} />
                ) : (
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                )}
              </Avatar>
              
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </>
          ) : (
            <Button onClick={handleSignIn} className="z-50">
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navigation;
