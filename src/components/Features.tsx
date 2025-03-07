
import React from 'react';
import { ArrowRight, Layers, Zap, Shield, Users, BarChart, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const Features: React.FC = () => {
  const featureCards = [
    {
      icon: <Layers className="h-6 w-6" />,
      title: 'Intuitive Dashboard',
      description: 'Command your data with a clean, thoughtfully designed interface that puts everything at your fingertips.'
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: 'Lightning Fast',
      description: 'Experience remarkable speed with our optimized platform that responds instantly to every interaction.'
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Enterprise Security',
      description: 'Rest easy with bank-level encryption, regular security audits, and comprehensive compliance measures.'
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Team Collaboration',
      description: 'Work together seamlessly with intuitive sharing tools, real-time updates, and role-based permissions.'
    },
    {
      icon: <BarChart className="h-6 w-6" />,
      title: 'Advanced Analytics',
      description: 'Make data-driven decisions with customizable reports and insightful visualizations of your metrics.'
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: 'Global Scaling',
      description: 'Grow without limits using our infrastructure designed to handle worldwide traffic with minimal latency.'
    }
  ];
  
  return (
    <section id="features" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16 md:mb-20">
          <p className="text-sm font-medium text-primary mb-3">Features</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">Everything you need to succeed</h2>
          <p className="text-xl text-muted-foreground">
            Our platform provides all the tools necessary to streamline your workflow, enhance collaboration, and deliver exceptional results.
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
