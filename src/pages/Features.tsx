
import React, { useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { ArrowRight, CheckCircle, Zap, Shield, Users, BarChart, Globe, Layers, Clock, Code, Server, Puzzle } from 'lucide-react';
import Button from '@/components/Button';

const Features = () => {
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const mainFeatures = [
    {
      icon: <Layers className="h-10 w-10" />,
      title: 'Intuitive Dashboard',
      description: 'Command your data with a clean, thoughtfully designed interface that puts everything at your fingertips.',
      points: [
        'Simple and intuitive user interface',
        'Customizable widgets and layouts',
        'Real-time data visualization',
        'User-friendly navigation system'
      ]
    },
    {
      icon: <Zap className="h-10 w-10" />,
      title: 'Lightning Fast',
      description: 'Experience remarkable speed with our optimized platform that responds instantly to every interaction.',
      points: [
        'Optimized performance across all devices',
        'Instant loading times',
        'Efficient data processing',
        'Background synchronization'
      ]
    },
    {
      icon: <Shield className="h-10 w-10" />,
      title: 'Enterprise Security',
      description: 'Rest easy with bank-level encryption, regular security audits, and comprehensive compliance measures.',
      points: [
        'End-to-end encryption for all data',
        'Multi-factor authentication',
        'Regular security audits',
        'Compliance with industry standards'
      ]
    },
    {
      icon: <Users className="h-10 w-10" />,
      title: 'Team Collaboration',
      description: 'Work together seamlessly with intuitive sharing tools, real-time updates, and role-based permissions.',
      points: [
        'Real-time collaboration capabilities',
        'Fine-grained permission controls',
        'Activity audit logs',
        'Document versioning and history'
      ]
    },
    {
      icon: <BarChart className="h-10 w-10" />,
      title: 'Advanced Analytics',
      description: 'Make data-driven decisions with customizable reports and insightful visualizations of your metrics.',
      points: [
        'Custom report builder',
        'Interactive data visualizations',
        'Trend analysis tools',
        'Automated reporting schedule'
      ]
    },
    {
      icon: <Globe className="h-10 w-10" />,
      title: 'Global Scaling',
      description: 'Grow without limits using our infrastructure designed to handle worldwide traffic with minimal latency.',
      points: [
        'Global CDN for fast content delivery',
        'Distributed database architecture',
        'Auto-scaling resources',
        'High availability infrastructure'
      ]
    }
  ];
  
  const additionalFeatures = [
    {
      icon: <Clock className="h-5 w-5" />,
      title: 'Automation'
    },
    {
      icon: <Code className="h-5 w-5" />,
      title: 'API Access'
    },
    {
      icon: <Server className="h-5 w-5" />,
      title: 'Data Migration'
    },
    {
      icon: <Puzzle className="h-5 w-5" />,
      title: 'Integrations'
    }
  ];
  
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-28">
        {/* Hero section */}
        <section className="py-16 md:py-24 bg-secondary/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Powerful features to power your business</h1>
              <p className="text-xl text-muted-foreground mb-8">
                Discover all the tools and features that make our platform the preferred choice for businesses worldwide.
              </p>
              <Button size="lg">
                Start Free Trial
              </Button>
            </div>
          </div>
        </section>
        
        {/* Feature details */}
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-20 lg:gap-24">
              {mainFeatures.map((feature, index) => (
                <div key={index} className="relative">
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                      {feature.icon}
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold ml-4">{feature.title}</h2>
                  </div>
                  
                  <p className="text-lg text-muted-foreground mb-6">{feature.description}</p>
                  
                  <ul className="space-y-3">
                    {feature.points.map((point, i) => (
                      <li key={i} className="flex items-start">
                        <CheckCircle className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
                        <span className="ml-3">{point}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="mt-8">
                    <a 
                      href="#" 
                      className="inline-flex items-center text-primary hover:text-primary/80 transition-colors font-medium"
                    >
                      Learn more <ArrowRight className="h-4 w-4 ml-1" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Additional features */}
        <section className="py-16 md:py-24 bg-secondary/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">And much more...</h2>
              <p className="text-xl text-muted-foreground">
                Our platform is packed with features designed to help your business succeed.
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
              {additionalFeatures.map((feature, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-xl p-6 text-center shadow-subtle border border-border hover:shadow-glossy transition-all duration-300"
                >
                  <div className="w-12 h-12 mx-auto flex items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                </div>
              ))}
            </div>
            
            <div className="mt-16 text-center">
              <Button size="lg">
                View All Features
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Features;
