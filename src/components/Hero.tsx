
import React from 'react';
import Button from './Button';

const Hero: React.FC = () => {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[600px] h-[600px] rounded-full bg-secondary/80 blur-3xl"></div>
      </div>
      
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
            <span className="inline-block w-2 h-2 rounded-full bg-primary mr-2"></span>
            Introducing our platform
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight sm:leading-tight md:leading-tight mb-6 text-balance animate-slide-in">
            Build incredible experiences without limits
          </h1>
          
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto text-balance animate-slide-in [animation-delay:200ms]">
            The comprehensive platform designed to streamline your workflow, enhance collaboration, and deliver exceptional results.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-in [animation-delay:300ms]">
            <Button size="lg">
              Get Started
            </Button>
            <Button variant="outline" size="lg">
              Watch Demo
            </Button>
          </div>
          
          <div className="mt-20 max-w-4xl mx-auto animate-fade-in [animation-delay:600ms]">
            <div className="relative">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl blur-xl opacity-70"></div>
              <div className="glass rounded-xl shadow-elevated p-2">
                <div className="relative bg-secondary/40 aspect-[16/9] rounded-lg overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-background to-transparent opacity-30"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-xl font-medium text-foreground/50">Platform Dashboard Preview</div>
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
