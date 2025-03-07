
import React, { useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Button from '@/components/Button';

const About = () => {
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const teamMembers = [
    {
      name: 'Alex Chen',
      role: 'Founder & CEO',
      bio: 'Alex has over 15 years of experience in the tech industry and is passionate about creating tools that help businesses succeed.'
    },
    {
      name: 'Sophia Rodriguez',
      role: 'CTO',
      bio: 'Sophia leads our engineering team with her expertise in scalable architecture and cutting-edge technology solutions.'
    },
    {
      name: 'Michael Kim',
      role: 'Head of Product',
      bio: 'Michael focuses on creating intuitive user experiences and ensuring our product meets the evolving needs of our customers.'
    },
    {
      name: 'Olivia Wilson',
      role: 'Chief Design Officer',
      bio: 'Olivia brings her passion for aesthetic excellence and functional design to every aspect of our platform.'
    }
  ];
  
  const timeline = [
    {
      year: '2018',
      title: 'Company Founded',
      description: 'Started with a vision to create the most intuitive business platform.'
    },
    {
      year: '2019',
      title: 'First Major Release',
      description: 'Launched our core platform after months of development and testing.'
    },
    {
      year: '2020',
      title: 'Expanding the Team',
      description: 'Grew to 25 team members and expanded to international markets.'
    },
    {
      year: '2021',
      title: 'Series A Funding',
      description: 'Secured $8M in funding to accelerate product development and growth.'
    },
    {
      year: '2022',
      title: 'Enterprise Solutions',
      description: 'Launched our enterprise-grade features and welcomed our first Fortune 500 clients.'
    },
    {
      year: '2023',
      title: 'Global Expansion',
      description: 'Opened offices in Europe and Asia to better serve our international customers.'
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
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Story</h1>
              <p className="text-xl text-muted-foreground">
                We're on a mission to empower businesses with tools that are both powerful and easy to use.
              </p>
            </div>
          </div>
        </section>
        
        {/* About content */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="prose prose-lg max-w-none">
                <p className="text-xl leading-relaxed mb-6">
                  Founded in 2018, our company was born from a simple observation: businesses were struggling with complex, unintuitive software that hindered rather than helped their growth.
                </p>
                
                <p className="text-lg leading-relaxed mb-6">
                  We set out to create a platform that combines powerful functionality with elegant simplicity. Our team of experienced designers and engineers worked tirelessly to develop a solution that feels intuitive from the first use, while providing the advanced capabilities that growing businesses need.
                </p>
                
                <p className="text-lg leading-relaxed mb-10">
                  Today, thousands of companies around the world rely on our platform to streamline their operations, enhance collaboration, and deliver exceptional results. We continue to innovate and improve, guided by our core values of simplicity, quality, and customer success.
                </p>
                
                <h2 className="text-3xl font-bold mb-6">Our Values</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                  <div className="bg-white rounded-xl p-6 shadow-subtle border border-border">
                    <h3 className="text-xl font-semibold mb-3">Simplicity</h3>
                    <p className="text-muted-foreground">
                      We believe that great design removes complexity, not adds to it. We strive for elegant solutions that feel effortless to use.
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-xl p-6 shadow-subtle border border-border">
                    <h3 className="text-xl font-semibold mb-3">Quality</h3>
                    <p className="text-muted-foreground">
                      We are meticulous about crafting experiences that meet the highest standards of performance, reliability, and user satisfaction.
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-xl p-6 shadow-subtle border border-border">
                    <h3 className="text-xl font-semibold mb-3">Customer Success</h3>
                    <p className="text-muted-foreground">
                      Our ultimate measure of success is your success. We're committed to being a partner in your growth, not just a vendor.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Timeline */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Journey</h2>
              <p className="text-xl text-muted-foreground">
                From humble beginnings to where we are today.
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-0.5 bg-border transform md:translate-x-px"></div>
                
                {/* Timeline entries */}
                {timeline.map((entry, index) => (
                  <div key={index} className="relative mb-12">
                    <div className={`flex flex-col md:flex-row items-center ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                      {/* Year bubble */}
                      <div className="absolute left-0 md:left-1/2 w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium text-sm transform -translate-x-1/2 z-10">
                        {entry.year.substring(2)}
                      </div>
                      
                      {/* Content */}
                      <div className={`ml-12 md:ml-0 md:w-1/2 ${index % 2 === 0 ? 'md:mr-12 md:text-right' : 'md:ml-12'}`}>
                        <div className="bg-white rounded-xl p-6 shadow-subtle border border-border">
                          <div className="text-sm text-primary font-medium mb-2">{entry.year}</div>
                          <h3 className="text-xl font-semibold mb-2">{entry.title}</h3>
                          <p className="text-muted-foreground">{entry.description}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        
        {/* Team */}
        <section className="py-20 bg-secondary/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Meet Our Team</h2>
              <p className="text-xl text-muted-foreground">
                The passionate people behind our platform.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-xl overflow-hidden shadow-subtle border border-border"
                >
                  <div className="aspect-square bg-secondary/50 flex items-center justify-center">
                    <div className="text-4xl font-light text-muted-foreground/50">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                    <p className="text-primary text-sm mb-4">{member.role}</p>
                    <p className="text-muted-foreground text-sm">{member.bio}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="max-w-xl mx-auto mt-16 text-center">
              <h3 className="text-2xl font-bold mb-4">Join Our Team</h3>
              <p className="text-muted-foreground mb-8">
                We're always looking for talented individuals to join our mission.
              </p>
              <Button>View Open Positions</Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;
