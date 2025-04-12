
import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const DashboardLoading: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
        <div className="flex justify-center items-center h-full">
          <div className="animate-pulse text-muted-foreground">Loading dashboard...</div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DashboardLoading;
