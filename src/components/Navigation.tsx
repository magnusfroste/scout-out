import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User } from 'lucide-react';
import Button from './Button';
import { useAuth } from '@/contexts/AuthContext';

const Navigation: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  
  const links = [
    { name: 'Home', path: '/' },
    { name: 'Features', path: '/features' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'About', path: '/about' },
    ...(user ? [{ name: 'Dashboard', path: '/dashboard' }] : [])
  ];
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);
  
  const handleSignOut = async () => {
    await signOut();
  };
  
  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-350 ${
        isScrolled ? 'py-3 bg-background/80 backdrop-blur-md shadow-subtle' : 'py-5 bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link 
            to="/" 
            className="flex items-center"
          >
            <span className="font-semibold text-xl tracking-tight">SaaS</span>
          </Link>
          
          <nav className="hidden md:flex space-x-8">
            {links.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-primary relative ${
                  location.pathname === link.path ? 'text-primary' : 'text-foreground/80'
                }`}
              >
                {link.name}
                {location.pathname === link.path && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            ))}
          </nav>
          
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  <span className="text-sm">{user.email}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" as={Link} to="/auth">
                  Sign In
                </Button>
                <Button size="sm" as={Link} to="/auth">
                  Get Started
                </Button>
              </>
            )}
          </div>
          
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden flex items-center p-2 rounded-md text-foreground"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>
      
      <div
        className={`md:hidden fixed inset-0 z-40 bg-background transition-transform duration-350 ease-in-out transform ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full pt-20 pb-6 px-6">
          <nav className="flex flex-col space-y-5 mt-8">
            {links.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-lg font-medium ${
                  location.pathname === link.path ? 'text-primary' : 'text-foreground/80'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
          
          <div className="mt-auto flex flex-col space-y-4">
            {user ? (
              <>
                <div className="flex items-center py-2">
                  <User className="h-5 w-5 mr-2" />
                  <span>{user.email}</span>
                </div>
                <Button variant="outline" className="w-full justify-center" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" className="w-full justify-center" as={Link} to="/auth">
                  Sign In
                </Button>
                <Button className="w-full justify-center" as={Link} to="/auth">
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
