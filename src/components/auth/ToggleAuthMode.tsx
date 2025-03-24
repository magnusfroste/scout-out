
import React from 'react';

interface ToggleAuthModeProps {
  isSignUp: boolean;
  onToggle: () => void;
  disabled: boolean;
}

const ToggleAuthMode: React.FC<ToggleAuthModeProps> = ({ 
  isSignUp, 
  onToggle, 
  disabled 
}) => {
  return (
    <div className="mt-6 text-center">
      <button
        type="button"
        onClick={onToggle}
        className="text-primary text-sm hover:underline transition-all"
        disabled={disabled}
      >
        {isSignUp 
          ? 'Already have an account? Sign In' 
          : 'Don\'t have an account? Sign Up'}
      </button>
    </div>
  );
};

export default ToggleAuthMode;
