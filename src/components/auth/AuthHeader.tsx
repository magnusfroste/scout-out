
import React from 'react';

interface AuthHeaderProps {
  isSignUp: boolean;
}

const AuthHeader: React.FC<AuthHeaderProps> = ({ isSignUp }) => {
  return (
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold">
        {isSignUp ? 'Create an Account' : 'Welcome Back'}
      </h1>
      <p className="text-muted-foreground mt-2">
        {isSignUp 
          ? 'Sign up to get started with our platform' 
          : 'Sign in to your account to continue'}
      </p>
    </div>
  );
};

export default AuthHeader;
