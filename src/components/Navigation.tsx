import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from "@/lib/utils";

const Navigation = () => {
  const { user, userProfile } = useAuth();
  
  return (
    <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-14 items-center">
        <Link to="/" className="mr-auto font-bold text-2xl">
          Lovable
        </Link>
        
        <div className="flex items-center gap-4 ml-auto">
          {user ? (
            <>
              <Button variant="ghost" asChild>
                <Link to="/dashboard">Dashboard</Link>
              </Button>
              {userProfile?.is_admin && (
                <Button variant="ghost" asChild>
                  <Link to="/settings">Settings</Link>
                </Button>
              )}
              <Button variant="ghost" asChild>
                <Link to="/profile">Profile</Link>
              </Button>
              <Button variant="outline" onClick={() => {}}>
                <a href="#" onClick={useAuth().signOut}>Sign Out</a>
              </Button>
            </>
          ) : (
            <Button variant="outline" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navigation;
