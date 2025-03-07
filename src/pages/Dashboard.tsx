
import React from 'react';
import { Navigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Dashboard = () => {
  const { user, loading } = useAuth();

  // If not loading and no user, redirect to auth page
  if (!loading && !user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-grow container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground mb-8">Welcome to your personal dashboard</p>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-2">Account Summary</h3>
                  <p className="text-muted-foreground mb-4">
                    You're logged in as <span className="font-medium">{user?.email}</span>
                  </p>
                  <div className="border-t pt-4 mt-4">
                    <p className="text-sm text-muted-foreground">
                      Account created: {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </Card>
                
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-2">Quick Links</h3>
                  <ul className="space-y-2">
                    <li>
                      <a 
                        href="#" 
                        className="text-primary hover:underline"
                        onClick={(e) => e.preventDefault()}
                      >
                        Documentation
                      </a>
                    </li>
                    <li>
                      <a 
                        href="#" 
                        className="text-primary hover:underline"
                        onClick={(e) => e.preventDefault()}
                      >
                        Support
                      </a>
                    </li>
                    <li>
                      <a 
                        href="#" 
                        className="text-primary hover:underline"
                        onClick={(e) => e.preventDefault()}
                      >
                        Settings
                      </a>
                    </li>
                  </ul>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="profile">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Profile Information</h3>
                <p className="text-muted-foreground mb-4">
                  Manage your profile details and preferences.
                </p>
                <div className="border-t pt-4 mt-4">
                  <p className="mb-2">
                    <span className="font-medium">Email:</span> {user?.email}
                  </p>
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="settings">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Account Settings</h3>
                <p className="text-muted-foreground mb-4">
                  Manage your account settings and preferences.
                </p>
                <div className="border-t pt-4 mt-4">
                  <p className="text-sm text-muted-foreground">
                    More settings options coming soon.
                  </p>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
