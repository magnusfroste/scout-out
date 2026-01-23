import React from 'react';
import { ArrowRight, Search, Target, Send, Sparkles, Users, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const Features: React.FC = () => {
  const featureCards = [
    {
      icon: <Search className="h-6 w-6" />,
      title: 'Deep Prospect Research',
      description: 'AI-powered scouting that digs deep into company strategy, growth plans, and business challenges.'
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: 'Smart Qualification',
      description: 'Custom qualification questions that identify high-potential prospects matching your ideal customer profile.'
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Contact Discovery',
      description: 'Find decision-makers and key contacts with verified information for direct outreach.'
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: 'AI-Generated Insights',
      description: 'Get actionable recommendations on how to approach each prospect based on their specific needs.'
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: 'Personalized Proposals',
      description: 'Generate tailored value propositions that highlight how your solutions address prospect pain points.'
    },
    {
      icon: <Send className="h-6 w-6" />,
      title: 'Ready-to-Send Outreach',
      description: 'Craft personalized email subjects, introductions, and talking points for confident outreach.'
    }
  ];
  
  return (
    <section id="features" className="py-20 md:py-32 bg-secondary/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16 md:mb-20">
          <p className="text-sm font-medium text-primary mb-3">Features</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">Scout Smarter, Reach Further</h2>
          <p className="text-xl text-muted-foreground">
            Everything you need to research prospects and reach out with confidence.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {featureCards.map((feature, index) => (
            <div 
              key={index} 
              className="group relative bg-white rounded-xl border border-border p-6 shadow-subtle transition-all duration-300 hover:shadow-glossy hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground mb-4">{feature.description}</p>
                <Link 
                  to="/features" 
                  className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Learn more <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
