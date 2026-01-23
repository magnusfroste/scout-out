
import React from 'react';
import { Button } from './ui/button';
import { CheckCircle, Search, Send, Target, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import ScoutOutLogo from './ScoutOutLogo';

const Hero: React.FC = () => {
  const features = [
    { icon: Search, text: 'Deep prospect research' },
    { icon: Target, text: 'Smart qualification' },
    { icon: Send, text: 'Personalized outreach' },
    { icon: Sparkles, text: 'AI-powered insights' },
  ];

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Background gradient elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[600px] h-[600px] rounded-full bg-primary/10 blur-3xl"></div>
      </div>
      
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2 text-center md:text-left">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
                <span className="inline-block w-2 h-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                Research & Outreach Platform
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight sm:leading-tight md:leading-tight mb-6 text-balance animate-slide-in">
                Scout prospects.{' '}
                <span className="text-primary">Reach out</span>{' '}
                with confidence.
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto md:mx-0 text-balance animate-slide-in [animation-delay:200ms]">
                ScoutOut helps you research prospects deeply and craft personalized outreach that converts. Stop guessing, start connecting.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center md:justify-start gap-4 animate-slide-in [animation-delay:300ms]">
                <Button size="lg" asChild className="gap-2">
                  <Link to="/auth">
                    Start Scouting
                    <Search className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/#how-it-works">
                    See How It Works
                  </Link>
                </Button>
              </div>
              
              <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-lg mx-auto md:mx-0">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 animate-slide-in" style={{ animationDelay: `${400 + index * 100}ms` }}>
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10">
                      <feature.icon className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="text-sm">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="md:w-1/2 animate-fade-in [animation-delay:600ms]">
              <div className="relative">
                <div className="absolute -inset-1.5 bg-gradient-to-r from-primary/30 to-primary/10 rounded-xl blur-xl opacity-70"></div>
                <div className="glass rounded-xl shadow-elevated p-4 bg-background/80 backdrop-blur-sm border">
                  <div className="relative bg-card aspect-[4/3] rounded-lg overflow-hidden border">
                    <div className="absolute inset-0 flex flex-col p-5">
                      {/* Mock UI - Research Card */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <Target className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="h-4 w-32 bg-foreground/10 rounded mb-1"></div>
                          <div className="h-3 w-24 bg-muted-foreground/20 rounded"></div>
                        </div>
                        <div className="px-2 py-1 rounded-full bg-green-500/10 text-green-600 text-xs font-medium">
                          92% match
                        </div>
                      </div>
                      
                      {/* Research insights */}
                      <div className="flex-1 space-y-3">
                        <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                          <div className="flex items-center gap-2 mb-2">
                            <Search className="h-3.5 w-3.5 text-primary" />
                            <span className="text-xs font-medium text-muted-foreground">Research Insights</span>
                          </div>
                          <div className="space-y-1.5">
                            <div className="h-2.5 w-full bg-foreground/10 rounded"></div>
                            <div className="h-2.5 w-4/5 bg-foreground/10 rounded"></div>
                            <div className="h-2.5 w-3/5 bg-foreground/10 rounded"></div>
                          </div>
                        </div>
                        
                        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                          <div className="flex items-center gap-2 mb-2">
                            <Send className="h-3.5 w-3.5 text-primary" />
                            <span className="text-xs font-medium text-primary">Ready to Reach Out</span>
                          </div>
                          <div className="space-y-1.5">
                            <div className="h-2.5 w-full bg-primary/20 rounded"></div>
                            <div className="h-2.5 w-2/3 bg-primary/20 rounded"></div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Action button */}
                      <div className="flex justify-end mt-4">
                        <div className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-xs font-medium flex items-center gap-1.5">
                          <Send className="h-3 w-3" />
                          Send Outreach
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
