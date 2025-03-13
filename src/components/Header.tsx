import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Header = () => {
  const { user, userProfile, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/auth';
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

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const isActive = (path: string) => {
    return location.pathname === path ? 'text-primary font-medium' : 'text-foreground hover:text-primary';
  };
  
  return (
    <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold">
            <Link to="/" className="hover:text-primary transition-colors" onClick={closeMobileMenu}>
              Master Business Agent
            </Link>
          </h1>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex ml-10">
            <ul className="flex space-x-8">
              <li>
                <Link to="/features" className={`text-sm ${isActive('/features')} transition-colors`}>
                  Features
                </Link>
              </li>
              <li>
                <Link to="/pricing" className={`text-sm ${isActive('/pricing')} transition-colors`}>
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/about" className={`text-sm ${isActive('/about')} transition-colors`}>
                  About
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
        
        {/* Desktop Auth/User Menu */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <Link to="/dashboard" className={`text-sm ${isActive('/dashboard')} transition-colors`}>
                Dashboard
              </Link>
              {userProfile?.is_admin && (
                <Link to="/settings" className={`text-sm ${isActive('/settings')} transition-colors`}>
                  Settings
                </Link>
              )}
              <Link to="/profile" className={`text-sm ${isActive('/profile')} transition-colors`}>
                Profile
              </Link>
              
              <Avatar className="h-8 w-8 border">
                {userProfile?.avatar_url ? (
                  <AvatarImage src={userProfile.avatar_url} alt={userProfile?.first_name || 'User'} />
                ) : (
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                )}
              </Avatar>
              
              <Button 
                variant="outline"
                onClick={handleSignOut}
                size="sm"
              >
                Sign Out
              </Button>
            </>
          ) : (
            <Button asChild size="sm">
              <Link to="/auth">
                Sign In
              </Link>
            </Button>
          )}
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t">
          <nav className="container mx-auto px-4 py-4">
            <ul className="space-y-4">
              <li>
                <Link 
                  to="/features" 
                  className={`block text-base ${isActive('/features')} transition-colors`}
                  onClick={closeMobileMenu}
                >
                  Features
                </Link>
              </li>
              <li>
                <Link 
                  to="/pricing" 
                  className={`block text-base ${isActive('/pricing')} transition-colors`}
                  onClick={closeMobileMenu}
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className={`block text-base ${isActive('/about')} transition-colors`}
                  onClick={closeMobileMenu}
                >
                  About
                </Link>
              </li>
              
              {/* Mobile Auth/User Menu */}
              {user ? (
                <>
                  <li className="pt-4 border-t">
                    <Link 
                      to="/dashboard" 
                      className={`block text-base ${isActive('/dashboard')} transition-colors`}
                      onClick={closeMobileMenu}
                    >
                      Dashboard
                    </Link>
                  </li>
                  {userProfile?.is_admin && (
                    <li>
                      <Link 
                        to="/settings" 
                        className={`block text-base ${isActive('/settings')} transition-colors`}
                        onClick={closeMobileMenu}
                      >
                        Settings
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link 
                      to="/profile" 
                      className={`block text-base ${isActive('/profile')} transition-colors`}
                      onClick={closeMobileMenu}
                    >
                      Profile
                    </Link>
                  </li>
                  <li className="pt-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 border">
                        {userProfile?.avatar_url ? (
                          <AvatarImage src={userProfile.avatar_url} alt={userProfile?.first_name || 'User'} />
                        ) : (
                          <AvatarFallback>{getInitials()}</AvatarFallback>
                        )}
                      </Avatar>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          handleSignOut();
                          closeMobileMenu();
                        }}
                        size="sm"
                      >
                        Sign Out
                      </Button>
                    </div>
                  </li>
                </>
              ) : (
                <li className="pt-4 border-t">
                  <Button 
                    asChild 
                    className="w-full"
                    onClick={closeMobileMenu}
                  >
                    <Link to="/auth">
                      Sign In
                    </Link>
                  </Button>
                </li>
              )}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
