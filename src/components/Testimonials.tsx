import React from 'react';

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company: string;
}

const Testimonials: React.FC = () => {
  const testimonials: Testimonial[] = [
    {
      quote: "ScoutOut has transformed how we find and approach prospects. The AI research saves us hours, and the personalized proposals help us connect in ways that actually resonate.",
      author: "Michael Chen",
      role: "Head of Sales",
      company: "GrowthForce"
    },
    {
      quote: "The deep research capabilities are incredible. ScoutOut uncovers insights we'd never find manually, and the outreach suggestions are spot-on. Our response rates have doubled.",
      author: "Sarah Martinez",
      role: "Business Development Director",
      company: "ScaleUp Solutions"
    },
    {
      quote: "Finally, a tool that gets prospecting right. ScoutOut's qualification questions help us focus on the right opportunities, and the proposals practically write themselves.",
      author: "James Wilson",
      role: "Sales Operations Manager",
      company: "NextLevel Tech"
    }
  ];
  
  return (
    <section className="py-20 md:py-32 bg-background relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none opacity-50">
        <div className="absolute top-1/2 right-0 translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 translate-x-1/4 w-[600px] h-[600px] rounded-full bg-secondary/30 blur-3xl"></div>
      </div>
      
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-3xl mx-auto text-center mb-16 md:mb-20">
          <p className="text-sm font-medium text-primary mb-3">Testimonials</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">Trusted by Sales Teams Everywhere</h2>
          <p className="text-xl text-muted-foreground">
            See how ScoutOut helps teams research smarter and reach further.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl p-6 shadow-subtle border border-border hover:shadow-glossy transition-all duration-300"
            >
              <div className="mb-6">
                {[...Array(5)].map((_, i) => (
                  <svg 
                    key={i}
                    className="inline-block w-5 h-5 text-yellow-400 fill-current"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ))}
              </div>
              <blockquote className="text-lg mb-6">"{testimonial.quote}"</blockquote>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                  {testimonial.author.charAt(0)}
                </div>
                <div className="ml-3">
                  <p className="font-medium">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}, {testimonial.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-2">Trusted by growing sales teams worldwide</p>
          <div className="flex flex-wrap justify-center gap-8 mt-6">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i} 
                className="h-8 w-32 bg-foreground/10 rounded opacity-70 flex items-center justify-center"
              >
                <span className="text-foreground/30 text-sm font-medium">LOGO</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
