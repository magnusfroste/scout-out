import React, { useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { ArrowRight, CheckCircle, Search, Target, Send, Sparkles, Users, FileText, Building, ListChecks, Star, Zap } from 'lucide-react';
import Button from '@/components/Button';
import { Link } from 'react-router-dom';

const Features = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const mainFeatures = [
    {
      icon: <Search className="h-10 w-10" />,
      title: 'Deep Prospect Research',
      description: 'AI-powered scouting that goes beyond surface-level data to uncover real business insights.',
      points: [
        'Analyze company strategy, growth plans, and challenges',
        'Discover recent news, investments, and initiatives',
        'Identify pain points that match your solutions',
        'Get comprehensive research in minutes, not hours'
      ]
    },
    {
      icon: <Target className="h-10 w-10" />,
      title: 'Smart Qualification',
      description: 'Custom qualification questions that help you focus on the right opportunities.',
      points: [
        'Create questions tailored to your ideal customer',
        'AI generates qualification scores for each prospect',
        'Identify high-potential opportunities instantly',
        'Skip bad fits and prioritize your pipeline'
      ]
    },
    {
      icon: <Users className="h-10 w-10" />,
      title: 'Contact Discovery',
      description: 'Find the right people to talk to with verified contact information.',
      points: [
        'Identify decision-makers and key stakeholders',
        'Get verified email addresses and phone numbers',
        'Understand reporting structures and roles',
        'Connect with the people who can say yes'
      ]
    },
    {
      icon: <Sparkles className="h-10 w-10" />,
      title: 'AI-Generated Insights',
      description: 'Actionable recommendations based on deep analysis of each prospect.',
      points: [
        'Understand what matters most to each prospect',
        'Get strategic approach recommendations',
        'Identify talking points that resonate',
        'Leverage insights competitors don\'t have'
      ]
    },
    {
      icon: <FileText className="h-10 w-10" />,
      title: 'Personalized Proposals',
      description: 'Generate tailored value propositions that speak directly to prospect needs.',
      points: [
        'AI-crafted proposals based on research insights',
        'Highlight how your solutions address their challenges',
        'Customize messaging for each prospect',
        'Stand out from generic sales pitches'
      ]
    },
    {
      icon: <Send className="h-10 w-10" />,
      title: 'Ready-to-Send Outreach',
      description: 'Craft personalized emails and messages ready for confident outreach.',
      points: [
        'Personalized email subjects that get opened',
        'Tailored introductions that build rapport',
        'Talking points based on prospect research',
        'Follow-up advice and next steps'
      ]
    }
  ];
  
  const workflowSteps = [
    {
      icon: <Building className="h-5 w-5" />,
      title: 'Profile',
      description: 'Set up your business profile'
    },
    {
      icon: <ListChecks className="h-5 w-5" />,
      title: 'Questions',
      description: 'Define qualification criteria'
    },
    {
      icon: <Search className="h-5 w-5" />,
      title: 'Research',
      description: 'Scout and analyze prospects'
    },
    {
      icon: <Star className="h-5 w-5" />,
      title: 'Proposal',
      description: 'Generate personalized outreach'
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
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Scout Smarter. Reach Further.</h1>
              <p className="text-xl text-muted-foreground mb-8">
                Everything you need to research prospects and reach out with confidence – powered by AI.
              </p>
              <Link to="/auth">
                <Button size="lg">
                  Start Scouting <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
        
        {/* Workflow overview */}
        <section className="py-16 border-b">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Simple 4-Step Workflow</h2>
              <p className="text-muted-foreground">
                From profile setup to personalized outreach in four easy steps.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {workflowSteps.map((step, index) => (
                <div 
                  key={index}
                  className="relative bg-white rounded-xl p-6 text-center shadow-subtle border border-border"
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                    {index + 1}
                  </div>
                  <div className="w-12 h-12 mx-auto flex items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
                    {step.icon}
                  </div>
                  <h3 className="font-semibold mb-1">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Feature details */}
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Capabilities</h2>
              <p className="text-xl text-muted-foreground">
                Every feature designed to help you find, qualify, and connect with ideal prospects.
              </p>
            </div>
            
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
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA section */}
        <section className="py-16 md:py-24 bg-primary/5">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <Zap className="h-12 w-12 text-primary mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Scout Smarter?</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Join sales teams who research prospects in minutes, not hours.
              </p>
              <Link to="/auth">
                <Button size="lg">
                  Get Started Free <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Features;
