
        <Button
          type="button"
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
          onClick={handleGoogleSignIn}
          disabled={maintenanceMode}
        >
          {/* Removing the icon temporarily */}
          Sign {isSignUp ? 'up' : 'in'} with Google
        </Button>
