import React, { useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import { Search, Target, Send, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ScoutOutLogo from '@/components/ScoutOutLogo';

const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const values = [
    {
      icon: <Search className="h-6 w-6" />,
      title: 'Research First',
      description: 'Great outreach starts with deep understanding. We believe in doing the homework before making contact.'
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: 'Quality Over Quantity',
      description: 'One well-researched prospect beats ten cold leads. We help you focus on the opportunities that matter.'
    },
    {
      icon: <Send className="h-6 w-6" />,
      title: 'Personalized Outreach',
      description: 'Generic messages get ignored. Every prospect deserves messaging that speaks to their specific needs.'
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
              <ScoutOutLogo size="lg" className="justify-center mb-6" />
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Research Smarter. Reach Further.</h1>
              <p className="text-xl text-muted-foreground">
                We're building the future of B2B prospecting – where AI does the research so you can focus on building relationships.
              </p>
            </div>
          </div>
        </section>
        
        {/* Story section */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="prose prose-lg max-w-none">
                <h2 className="text-3xl font-bold mb-6">The ScoutOut Story</h2>
                
                <p className="text-xl leading-relaxed mb-6">
                  ScoutOut was born from a simple frustration: sales teams spend too much time researching and not enough time selling.
                </p>
                
                <p className="text-lg leading-relaxed mb-6">
                  We've all been there – hours spent digging through websites, LinkedIn profiles, news articles, and company reports just to understand a single prospect. And even after all that work, the outreach often falls flat because it's still too generic.
                </p>
                
                <p className="text-lg leading-relaxed mb-6">
                  We built ScoutOut to change that. Our AI-powered platform does the deep research in minutes, uncovering insights that would take hours to find manually. Then it helps you craft personalized proposals that actually resonate – because they're based on real understanding, not guesswork.
                </p>
                
                <p className="text-lg leading-relaxed mb-10">
                  The result? Sales teams that spend less time researching and more time having meaningful conversations with qualified prospects.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Values section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">What We Believe</h2>
              <p className="text-xl text-muted-foreground">
                The principles that guide everything we build.
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {values.map((value, index) => (
                  <div key={index} className="bg-secondary/10 rounded-xl p-6 text-center">
                    <div className="w-14 h-14 mx-auto flex items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                      {value.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                    <p className="text-muted-foreground">
                      {value.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        
        {/* Mission section */}
        <section className="py-20 bg-primary/5">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Mission</h2>
              <p className="text-xl text-muted-foreground mb-8">
                To help every sales professional approach prospects with the confidence that comes from deep understanding – not just cold data.
              </p>
              <p className="text-lg text-muted-foreground mb-10">
                We're democratizing the kind of research that used to be reserved for enterprise teams with big budgets. Now any sales professional can scout prospects like a pro.
              </p>
              <Link to="/auth">
                <Button size="lg">
                  Start Scouting <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
        
        {/* Contact section */}
        <section className="py-20 bg-secondary/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
              <p className="text-muted-foreground mb-8">
                Questions? Feedback? We'd love to hear from you.
              </p>
              <a href="mailto:hello@scoutout.com">
                <Button variant="outline">
                  Contact Us
                </Button>
              </a>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;
