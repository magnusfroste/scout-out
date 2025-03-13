import React, { useState } from 'react';
import { Check } from 'lucide-react';
import Button from './Button';

const Pricing: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(true);
  
  const plans = [
    {
      name: 'Starter',
      description: 'Perfect for individuals and small projects',
      monthlyPrice: 29,
      annualPrice: 290,
      features: [
        'Up to 5 projects',
        '10GB storage',
        'Email support'
      ],
      ctaText: 'Start Free Trial',
      highlight: false
    },
    {
      name: 'Professional',
      description: 'Ideal for growing teams and businesses',
      monthlyPrice: 79,
      annualPrice: 790,
      features: [
        'Unlimited projects',
        '100GB storage',
        'Priority support',
        'Team collaboration'
      ],
      ctaText: 'Start Free Trial',
      highlight: true
    },
    {
      name: 'Enterprise',
      description: 'Advanced features for large organizations',
      monthlyPrice: 199,
      annualPrice: 1990,
      features: [
        'Unlimited everything',
        '1TB storage',
        'Dedicated support',
        'Advanced collaboration',
        'Custom training'
      ],
      ctaText: 'Contact Sales',
      highlight: false
    }
  ];
  
  return (
    <section id="pricing" className="py-20 md:py-32 bg-secondary/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <p className="text-sm font-medium text-primary mb-3">Pricing</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">Simple, transparent pricing</h2>
          <p className="text-xl text-muted-foreground mb-10">
            Choose the perfect plan for your needs. Always know what you'll pay.
          </p>
          
          <div className="flex items-center justify-center mb-10">
            <div className="relative flex items-center p-1 rounded-full bg-secondary border border-border w-fit">
              <button
                onClick={() => setIsAnnual(false)}
                className={`relative z-10 px-4 py-2 text-sm rounded-full transition-colors ${
                  !isAnnual ? 'text-primary-foreground' : 'text-foreground'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={`relative z-10 px-4 py-2 text-sm rounded-full transition-colors ${
                  isAnnual ? 'text-primary-foreground' : 'text-foreground'
                }`}
              >
                Annual (Save 20%)
              </button>
              <div 
                className={`absolute top-1 bottom-1 ${
                  isAnnual ? 'right-1 left-[50%]' : 'left-1 right-[50%]'
                } bg-primary rounded-full transition-all duration-300`}
              ></div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`relative rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
                plan.highlight 
                  ? 'shadow-elevated border-primary border-2 bg-white' 
                  : 'shadow-subtle border border-border bg-card'
              }`}
            >
              {plan.highlight && (
                <div className="absolute top-0 left-0 right-0 py-2 text-center text-xs font-medium text-primary-foreground bg-primary">
                  Most Popular
                </div>
              )}
              <div className={`p-6 ${plan.highlight ? 'pt-10' : ''}`}>
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="text-muted-foreground mt-2 min-h-[50px]">{plan.description}</p>
                <div className="mt-6 mb-6">
                  <span className="text-4xl font-bold">
                    €{isAnnual ? plan.annualPrice : plan.monthlyPrice}
                  </span>
                  <span className="text-muted-foreground ml-2">
                    {isAnnual ? '/year' : '/month'}
                  </span>
                </div>
                
                <Button 
                  className={`w-full ${plan.highlight ? 'bg-primary' : ''}`}
                >
                  {plan.ctaText}
                </Button>
                
                <ul className="mt-8 space-y-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <span className="flex-shrink-0 mt-1">
                        <Check className="h-5 w-5 text-primary" />
                      </span>
                      <span className="ml-3 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 max-w-3xl mx-auto text-center">
          <p className="text-muted-foreground">
            All plans include a 14-day free trial. No credit card required. <br />
            Need a custom plan? <a href="#" className="text-primary hover:underline">Contact our sales team</a>.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
