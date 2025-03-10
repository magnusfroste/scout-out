
import React from 'react';
import { Clock, Award, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Benefits: React.FC = () => {
  const benefits = [
    {
      icon: <Clock className="h-10 w-10" />,
      title: "Save Valuable Time",
      description: "Our AI Agent does the research for you, freeing up more time to focus on high-leverage sales activities that drive results."
    },
    {
      icon: <Award className="h-10 w-10" />,
      title: "Higher Quality Insights",
      description: "Get more accurate and comprehensive information by leveraging multiple knowledge bases for deeper research."
    },
    {
      icon: <ArrowUpRight className="h-10 w-10" />,
      title: "Make a Lasting First Impression",
      description: "Our tailored email drafts ensure you make a strong impression on potential clients, increasing your success rate."
    }
  ];

  const deliverables = [
    "Detailed answers to your sales questions",
    "Strategic recommendations based on research findings",
    "Verified contact details for potential clients",
    "100% personalized email drafts tailored to each client"
  ];

  return (
    <section className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16 md:mb-20">
          <p className="text-sm font-medium text-primary mb-3">Benefits</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">Why Business Developers Choose Us</h2>
          <p className="text-xl text-muted-foreground">
            Master Business Agent gives you a competitive edge by providing the insights you need to close more deals.
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
            <h3 className="text-2xl font-bold mb-4">What You Get</h3>
            <p className="text-muted-foreground mb-6">
              With Master Business Agent, you'll receive everything you need to approach potential clients with confidence:
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
                <span className="text-lg font-semibold">A</span>
              </div>
              <div className="flex-1">
                <h4 className="font-medium">Email Draft Example</h4>
                <p className="text-sm text-muted-foreground">Personalized outreach</p>
              </div>
            </div>
            <div className="border border-border rounded-md p-4 bg-gray-50">
              <p className="text-sm text-muted-foreground mb-2">Subject: Enhancing [Company]'s Growth Strategy with Targeted Solutions</p>
              <p className="text-sm mb-2">Dear [Name],</p>
              <p className="text-sm mb-2">After researching [Company]'s recent initiatives in [specific area], I noticed your focus on [specific goal or challenge mentioned on their website].</p>
              <p className="text-sm mb-2">Our solution has helped similar companies in [industry] achieve [specific benefit] by [explanation of how]...</p>
              <p className="text-sm text-muted-foreground">... and continues with more personalized content</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;
