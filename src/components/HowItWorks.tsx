import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Building, ListChecks, Star, ArrowRight, Target, Send, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      icon: <Building className="h-10 w-10" />,
      title: "Profile",
      description: "Set up your business profile so ScoutOut can tailor research and proposals to your unique offerings."
    },
    {
      icon: <ListChecks className="h-10 w-10" />,
      title: "Questions",
      description: "Define qualification questions that help identify the best opportunities and understand prospect needs."
    },
    {
      icon: <Search className="h-10 w-10" />,
      title: "Research",
      description: "Scout prospects with AI-powered deep research that uncovers insights, contacts, and opportunities."
    },
    {
      icon: <Star className="h-10 w-10" />,
      title: "Proposal",
      description: "Generate personalized proposals with tailored messaging ready for confident outreach."
    }
  ];

  const capabilities = [
    { icon: Target, text: "Identify decision-makers and key contacts" },
    { icon: Search, text: "Deep-dive into company strategy and growth plans" },
    { icon: Sparkles, text: "Uncover pain points that match your solutions" },
    { icon: Send, text: "Generate personalized outreach messaging" },
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-32 bg-secondary/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16 md:mb-20">
          <p className="text-sm font-medium text-primary mb-3">How It Works</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">Scout. Research. Reach Out.</h2>
          <p className="text-xl text-muted-foreground">
            A streamlined workflow to find, qualify, and connect with high-potential prospects.
          </p>
        </div>
        
        {/* Step visualization with connecting lines */}
        <div className="relative mb-16">
          {/* Connecting line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-primary/10 -translate-x-1/2 hidden md:block"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Step number */}
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-6 mx-auto",
                  "bg-primary text-primary-foreground shadow-lg"
                )}>
                  {index + 1}
                </div>
                
                {/* Arrow connector */}
                {index < steps.length - 1 && (
                  <div className="hidden md:flex absolute top-5 left-[calc(100%_-_10px)] transform -translate-x-1/2 z-10">
                    <ArrowRight className="h-6 w-6 text-primary" />
                  </div>
                )}
                
                <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 h-full bg-gradient-to-b from-white to-primary/5">
                  <CardHeader className="pb-2">
                    <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary/10 text-primary mb-4 mx-auto">
                      {step.icon}
                    </div>
                    <CardTitle className="text-xl text-center">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base text-center">
                      {step.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
        
        {/* Capabilities section */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-xl p-8 transform -translate-y-6 border border-gray-100">
            <div className="text-center max-w-3xl mx-auto mb-8">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                <Sparkles className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold mb-3">AI-Powered Scouting</h3>
              <p className="text-muted-foreground">
                ScoutOut's AI does the heavy lifting – researching prospects in depth so you can focus on building relationships.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {capabilities.map((capability, index) => (
                <div key={index} className="flex items-center gap-4 p-4 rounded-lg bg-secondary/10 hover:bg-secondary/20 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <capability.icon className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-foreground font-medium">{capability.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
