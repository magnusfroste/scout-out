import React from 'react';
import { Clock, Target, Send } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Benefits: React.FC = () => {
  const benefits = [
    {
      icon: <Clock className="h-10 w-10" />,
      title: "Scout in Minutes, Not Hours",
      description: "ScoutOut's AI does deep prospect research instantly, freeing you to focus on building relationships."
    },
    {
      icon: <Target className="h-10 w-10" />,
      title: "Qualify with Confidence",
      description: "Custom qualification questions help you identify the best opportunities and skip the wrong fits."
    },
    {
      icon: <Send className="h-10 w-10" />,
      title: "Reach Out with Impact",
      description: "Personalized proposals and outreach messaging that resonate with each prospect's specific needs."
    }
  ];

  const deliverables = [
    "Deep research insights on company strategy and challenges",
    "Decision-maker contacts with verified information",
    "AI-generated qualification scores",
    "Ready-to-send personalized outreach proposals"
  ];

  return (
    <section id="benefits" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16 md:mb-20">
          <p className="text-sm font-medium text-primary mb-3">Benefits</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">Why Teams Choose ScoutOut</h2>
          <p className="text-xl text-muted-foreground">
            Research smarter. Reach further. Close more deals.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {benefits.map((benefit, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="relative pb-2">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                  {benefit.icon}
                </div>
                <CardTitle className="text-xl">{benefit.title}</CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <CardDescription className="text-base">
                  {benefit.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="flex flex-col md:flex-row items-center bg-secondary/20 rounded-xl p-8 shadow-lg">
          <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
            <h3 className="text-2xl font-bold mb-4">What ScoutOut Delivers</h3>
            <p className="text-muted-foreground mb-6">
              Everything you need to approach prospects with confidence:
            </p>
            <ul className="space-y-3">
              {deliverables.map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="inline-flex items-center justify-center rounded-full bg-primary/20 w-6 h-6 text-primary text-xs font-medium mr-3 mt-0.5">
                    {index + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:w-1/2 bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary mr-4">
                <Send className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">Outreach Example</h4>
                <p className="text-sm text-muted-foreground">AI-generated proposal</p>
              </div>
            </div>
            <div className="border border-border rounded-md p-4 bg-gray-50">
              <p className="text-sm text-muted-foreground mb-2">Subject: Helping [Company] accelerate their digital transformation</p>
              <p className="text-sm mb-2">Hi [Name],</p>
              <p className="text-sm mb-2">I noticed [Company]'s focus on [specific initiative] and thought our experience with [relevant solution] could be valuable.</p>
              <p className="text-sm mb-2">We've helped similar companies achieve [specific outcome] – would love to explore if there's a fit.</p>
              <p className="text-sm text-muted-foreground">... personalized based on research insights</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;
