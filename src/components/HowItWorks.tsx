
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, FileText, ZapIcon, MessagesSquare, SendHorizonal, ArrowRight, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      icon: <FileText className="h-10 w-10" />,
      title: "1. Define Your Business",
      description: "Start by describing what your company offers and the challenges your solutions address for potential clients."
    },
    {
      icon: <Users className="h-10 w-10" />,
      title: "2. Customize Questions",
      description: "Create or select tailored questions that will help identify the best sales opportunities for your business."
    },
    {
      icon: <Search className="h-10 w-10" />,
      title: "3. Research Companies",
      description: "Input potential client names to research business opportunities based on your product or service offering."
    },
    {
      icon: <ZapIcon className="h-10 w-10" />,
      title: "4. Get Actionable Insights",
      description: "Receive comprehensive answers, verified contact details, and strategic recommendations to approach prospects."
    }
  ];

  const questions = [
    "What is the core activity of the company?",
    "How do they plan to grow? Are they actively growing by acquisitions?",
    "Where do they plan to invest in?",
    "What is the company saying about their corporate responsibility plans?",
    "Who is the head of process improvement?",
    "What statements can we find about their IT operations and systems?",
    "Have they been exposed to IT hackers/Ransomware activities recently?"
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-32 bg-secondary/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16 md:mb-20">
          <p className="text-sm font-medium text-primary mb-3">How It Works</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">Streamlined Workflow for Sales Success</h2>
          <p className="text-xl text-muted-foreground">
            Our platform guides you through a simple process to research and connect with high-potential clients.
          </p>
        </div>
        
        {/* Enhanced step visualization with connecting lines */}
        <div className="relative mb-16">
          {/* Connecting line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-primary/10 -translate-x-1/2 hidden md:block"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Step number with accent color background */}
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-6 mx-auto",
                  "bg-primary text-primary-foreground shadow-lg"
                )}>
                  {index + 1}
                </div>
                
                {/* Arrow connector - only show between cards */}
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
                    <CardTitle className="text-xl text-center">{step.title.split('.')[1].trim()}</CardTitle>
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
        
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold mb-6">Example Sales Questions Our AI Agent Can Answer:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {questions.map((question, index) => (
              <div key={index} className="flex items-start space-x-3">
                <ArrowRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-muted-foreground">{question}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
