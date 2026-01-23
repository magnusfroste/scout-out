import React from 'react';
import ScoutOutLogo from '@/components/ScoutOutLogo';

interface AuthHeaderProps {
  isSignUp: boolean;
}

const AuthHeader: React.FC<AuthHeaderProps> = ({ isSignUp }) => {
  return (
    <div className="text-center mb-8">
      <div className="flex justify-center mb-4">
        <ScoutOutLogo size="lg" />
      </div>
      <h1 className="text-3xl font-bold">
        {isSignUp ? 'Start Scouting' : 'Welcome Back'}
      </h1>
      <p className="text-muted-foreground mt-2">
        {isSignUp 
          ? 'Create your account to research smarter and reach further' 
          : 'Sign in to continue your prospect research'}
      </p>
    </div>
  );
};

export default AuthHeader;
