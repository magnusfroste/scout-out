
import React from 'react';
import { ArrowRight, Layers, Zap, Shield, Users, BarChart, Search, Database, Bot, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const Features: React.FC = () => {
  const featureCards = [
    {
      icon: <Search className="h-6 w-6" />,
      title: 'Advanced Research',
      description: 'Leverage AI to conduct comprehensive research on potential clients, uncovering insights you might otherwise miss.'
    },
    {
      icon: <Bot className="h-6 w-6" />,
      title: 'Intelligent Questions',
      description: 'Our AI automatically generates relevant sales questions by analyzing your web presence and industry.'
    },
    {
      icon: <Database className="h-6 w-6" />,
      title: 'Multiple Knowledge Bases',
      description: 'Access information from various sources to ensure you have the most comprehensive view of potential clients.'
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Contact Discovery',
      description: 'Identify the right decision-makers and get verified contact information to reach out directly.'
    },
    {
      icon: <Mail className="h-6 w-6" />,
      title: 'Email Drafting',
      description: 'Receive personalized email templates that highlight relevant pain points and solutions for each prospect.'
    },
    {
      icon: <BarChart className="h-6 w-6" />,
      title: 'Strategic Insights',
      description: 'Get recommendations on how to approach each prospect based on their specific business challenges and goals.'
    }
  ];
  
  return (
    <section id="features" className="py-20 md:py-32 bg-secondary/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16 md:mb-20">
          <p className="text-sm font-medium text-primary mb-3">Features</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">Everything You Need to Close More Deals</h2>
          <p className="text-xl text-muted-foreground">
            Our platform provides powerful tools to help you research, connect with, and convert potential clients more effectively.
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
