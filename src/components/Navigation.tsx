
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
  
  const handleNavClick = (elementId: string) => {
    // If we're already on the home page, smooth scroll to the section
    if (location.pathname === '/') {
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Navigate to home page with the hash
      navigate('/#' + elementId);
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
        
        {/* Show main navigation on public pages or when logged out */}
        {(isPublicPage || !user) && (
          <div className="hidden md:flex items-center space-x-4">
            <button 
              onClick={() => handleNavClick('how-it-works')} 
              className="text-sm font-medium px-4 py-2 rounded-md hover:bg-accent"
            >
              How It Works
            </button>
            <button 
              onClick={() => handleNavClick('benefits')} 
              className="text-sm font-medium px-4 py-2 rounded-md hover:bg-accent"
            >
              Benefits
            </button>
            <button 
              onClick={() => handleNavClick('features')} 
              className="text-sm font-medium px-4 py-2 rounded-md hover:bg-accent"
            >
              Features
            </button>
            <button 
              onClick={() => handleNavClick('pricing')} 
              className="text-sm font-medium px-4 py-2 rounded-md hover:bg-accent"
            >
              Pricing
            </button>
          </div>
        )}
        
        {/* Right side navigation */}
        <div className="flex items-center gap-4 ml-auto">
          {user ? (
            <>
              {/* Show dashboard link on non-dashboard pages */}
              {location.pathname !== '/dashboard' && (
                <Link to="/dashboard" className="text-sm font-medium px-4 py-2 rounded-md hover:bg-accent">
                  Workflow
                </Link>
              )}
              {/* Show settings link for all users */}
              <Link to="/settings" className="text-sm font-medium px-4 py-2 rounded-md hover:bg-accent">
                Settings
              </Link>
              {/* Show admin link for admins only */}
              {userProfile?.is_admin && (
                <Link to="/admin" className="text-sm font-medium px-4 py-2 rounded-md hover:bg-accent">
                  Admin
                </Link>
              )}
              {/* Show profile link on non-profile pages */}
              {location.pathname !== '/profile' && (
                <Link to="/profile" className="text-sm font-medium px-4 py-2 rounded-md hover:bg-accent">
                  Profile
                </Link>
              )}
              
              <Avatar className="h-8 w-8 border">
                {userProfile?.avatar_url ? (
                  <AvatarImage src={userProfile.avatar_url} alt={userProfile?.first_name || 'User'} />
                ) : (
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                )}
              </Avatar>
              
              <Button variant="outline" onClick={handleSignOut}>
                Sign out
              </Button>
            </>
          ) : (
            <Link to="/auth" className="inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navigation;
