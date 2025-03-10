
import React from 'react';
import { Button } from './ui/button';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero: React.FC = () => {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Background gradient elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[600px] h-[600px] rounded-full bg-purple-300/50 blur-3xl"></div>
      </div>
      
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2 text-center md:text-left">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
                <span className="inline-block w-2 h-2 rounded-full bg-primary mr-2"></span>
                AI-Powered Business Research
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight sm:leading-tight md:leading-tight mb-6 text-balance animate-slide-in">
                Unlock New Business Opportunities
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto md:mx-0 text-balance animate-slide-in [animation-delay:200ms]">
                Discover how our AI-powered research service helps business developers like you close more deals with personalized, data-driven insights.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center md:justify-start gap-4 animate-slide-in [animation-delay:300ms]">
                <Button size="lg" asChild>
                  <Link to="/auth">Get Started</Link>
                </Button>
                <Button variant="outline" size="lg">
                  Watch Demo
                </Button>
              </div>
              
              <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-lg mx-auto md:mx-0">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">AI-powered research</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Custom sales questions</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Personalized email drafts</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Data-driven insights</span>
                </div>
              </div>
            </div>
            
            <div className="md:w-1/2 animate-fade-in [animation-delay:600ms]">
              <div className="relative">
                <div className="absolute -inset-1.5 bg-gradient-to-r from-purple-300/50 to-primary/20 rounded-xl blur-xl opacity-70"></div>
                <div className="glass rounded-xl shadow-elevated p-2">
                  <div className="relative bg-white dark:bg-gray-800 aspect-[4/3] rounded-lg overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center p-6">
                      <div className="space-y-6 w-full">
                        <div className="space-y-2">
                          <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                          <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
                          <div className="space-y-2">
                            <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                            <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                            <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <div className="h-8 w-24 bg-primary/30 rounded"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
