
import React from 'react';
import { Check } from 'lucide-react';
import Button from './Button';

const plans = [
  {
    name: '5 Credits',
    description: 'Ideal for occasional use, freelancers, or as a quick top-up.',
    price: 5,
    credits: 5,
    features: [
      'Valid for any search',
      'No expiration',
      '1 credit = 10 questions/search',
    ],
    ctaText: 'Buy 5 Credits – €5',
    highlight: false,
    action: () => window.location.href = '/profile', // Send user to purchase
  },
  {
    name: '25 Credits',
    description: 'Best value—recommended for power users and teams.',
    price: 20,
    credits: 25,
    features: [
      'Valid for any search',
      'No expiration',
      '1 credit = 10 questions/search',
      'Great for recurring use or teams'
    ],
    ctaText: 'Buy 25 Credits – €20',
    highlight: true,
    action: () => window.location.href = '/profile', // Send user to purchase
  },
  {
    name: 'Custom',
    description: 'Need more than 25 credits or tailored solutions?',
    features: [
      'Custom credit packages',
      'Custom integrations',
      'Personalized onboarding',
      'Dedicated support',
    ],
    ctaText: 'Contact Sales',
    highlight: false,
    action: () => window.location.href = 'mailto:sales@yoursite.com', // Replace with your actual sales address
  }
];

const Pricing: React.FC = () => {
  return (
    <section id="pricing" className="py-20 md:py-32 bg-secondary/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <p className="text-sm font-medium text-primary mb-3">Pricing</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">Simple, transparent credit pricing</h2>
          <p className="text-xl text-muted-foreground mb-10">
            Buy credits—no subscriptions required. Only pay for what you use.
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
                  Most Popular
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
                      / one time
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
            Credits never expire. 1 credit = up to 10 questions per search. 
            <br />
            Need a larger or custom solution? <a href="mailto:sales@yoursite.com" className="text-primary hover:underline">Contact our sales team</a>.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
