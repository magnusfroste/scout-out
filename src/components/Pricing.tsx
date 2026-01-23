import React from 'react';
import { Check } from 'lucide-react';
import Button from './Button';

const plans = [
  {
    name: '5 Credits',
    description: 'Perfect for trying ScoutOut or occasional prospecting.',
    price: 5,
    credits: 5,
    features: [
      '5 prospect researches',
      'AI-powered insights',
      'Personalized proposals',
      'No expiration',
    ],
    ctaText: 'Get 5 Credits – €5',
    highlight: false,
    action: () => window.location.href = '/profile',
  },
  {
    name: '25 Credits',
    description: 'Best value for active prospecting and sales teams.',
    price: 20,
    credits: 25,
    features: [
      '25 prospect researches',
      'AI-powered insights',
      'Personalized proposals',
      'No expiration',
      'Save 20%',
    ],
    ctaText: 'Get 25 Credits – €20',
    highlight: true,
    action: () => window.location.href = '/profile',
  },
  {
    name: 'Custom',
    description: 'For teams with high-volume prospecting needs.',
    features: [
      'Custom credit packages',
      'Priority support',
      'Team onboarding',
      'Custom integrations',
    ],
    ctaText: 'Contact Us',
    highlight: false,
    action: () => window.location.href = 'mailto:hello@scoutout.com',
  }
];

const Pricing: React.FC = () => {
  return (
    <section id="pricing" className="py-20 md:py-32 bg-secondary/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <p className="text-sm font-medium text-primary mb-3">Pricing</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">Simple Credit-Based Pricing</h2>
          <p className="text-xl text-muted-foreground mb-10">
            Pay only for what you use. No subscriptions, no commitments.
          </p>
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
                  Best Value
                </div>
              )}
              <div className={`p-6 ${plan.highlight ? 'pt-10' : ''}`}>
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="text-muted-foreground mt-2 min-h-[50px]">{plan.description}</p>
                {plan.price && (
                  <div className="mt-6 mb-6">
                    <span className="text-4xl font-bold">
                      €{plan.price}
                    </span>
                    <span className="text-muted-foreground ml-2">
                      one-time
                    </span>
                  </div>
                )}
                {!plan.price && (
                  <div className="mt-6 mb-6 min-h-[46px] flex items-center justify-center">
                    <span className="text-lg font-medium text-muted-foreground">Custom pricing</span>
                  </div>
                )}
                <Button 
                  className={`w-full ${plan.highlight ? 'bg-primary' : ''}`}
                  onClick={plan.action}
                  type="button"
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
            Credits never expire. Each credit powers one complete prospect research with AI insights and proposal generation.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
