
import React, { useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Pricing from '@/components/Pricing';
import Testimonials from '@/components/Testimonials';
import Footer from '@/components/Footer';
import HowItWorks from '@/components/HowItWorks';
import Benefits from '@/components/Benefits';

const Index = () => {
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <Hero />
        <HowItWorks />
        <Benefits />
        <Features />
        <Pricing />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
