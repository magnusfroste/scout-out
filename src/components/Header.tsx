
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Menu, X, User, Settings, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Header = () => {
  const { user, userProfile, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
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

  const getUserDisplayName = () => {
    if (userProfile?.first_name) {
      return userProfile.first_name + (userProfile.last_name ? ` ${userProfile.last_name[0]}.` : '');
    }
    return 'Account';
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleNavClick = (elementId: string) => {
    closeMobileMenu();

    if (location.pathname === '/') {
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/#' + elementId);
    }
  };
  
  return (
    <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <h1 className="text-xl font-bold">
            <Link to="/" className="hover:text-primary transition-colors" onClick={closeMobileMenu}>
              Master Business Agent
            </Link>
          </h1>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex ml-10">
            <ul className="flex space-x-1">
              {['how-it-works', 'benefits', 'features', 'pricing'].map((item) => (
                <li key={item}>
                  <button 
                    onClick={() => handleNavClick(item)} 
                    className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                  >
                    {item.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 rounded-md hover:bg-accent transition-colors"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
        
        {/* Desktop Auth/User Menu */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              {/* Workflow Link */}
              <Button
                variant={isActive('/dashboard') ? 'secondary' : 'ghost'}
                size="sm"
                asChild
              >
                <Link to="/dashboard" className="gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  Workflow
                </Link>
              </Button>

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 pl-2 pr-3">
                    <Avatar className="h-7 w-7 border">
                      {userProfile?.avatar_url ? (
                        <AvatarImage src={userProfile.avatar_url} alt={userProfile?.first_name || 'User'} />
                      ) : (
                        <AvatarFallback className="text-xs">{getInitials()}</AvatarFallback>
                      )}
                    </Avatar>
                    <span className="text-sm font-medium">{getUserDisplayName()}</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center gap-2 cursor-pointer">
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleSignOut}
                    className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
        <div className="md:hidden border-t bg-background">
          <nav className="container mx-auto px-4 py-4">
            <ul className="space-y-1">
              {['how-it-works', 'benefits', 'features', 'pricing'].map((item) => (
                <li key={item}>
                  <button 
                    onClick={() => handleNavClick(item)} 
                    className="block w-full text-left px-3 py-2 text-base text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                  >
                    {item.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </button>
                </li>
              ))}
              
              {/* Mobile Auth/User Menu */}
              {user ? (
                <>
                  <li className="pt-4">
                    <div className="flex items-center gap-3 px-3 py-2 mb-2 bg-muted/50 rounded-lg">
                      <Avatar className="h-10 w-10 border">
                        {userProfile?.avatar_url ? (
                          <AvatarImage src={userProfile.avatar_url} alt={userProfile?.first_name || 'User'} />
                        ) : (
                          <AvatarFallback>{getInitials()}</AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{getUserDisplayName()}</p>
                        <p className="text-xs text-muted-foreground truncate">Manage your account</p>
                      </div>
                    </div>
                  </li>
                  <li>
                    <Link 
                      to="/dashboard" 
                      className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                        isActive('/dashboard') ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      }`}
                      onClick={closeMobileMenu}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Workflow
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/profile" 
                      className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                        isActive('/profile') ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      }`}
                      onClick={closeMobileMenu}
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/settings" 
                      className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                        isActive('/settings') ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      }`}
                      onClick={closeMobileMenu}
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                  </li>
                  <li className="pt-2">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        handleSignOut();
                        closeMobileMenu();
                      }}
                      className="w-full justify-start gap-3 text-destructive hover:text-destructive"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </Button>
                  </li>
                </>
              ) : (
                <li className="pt-4">
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
