import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { fetchWebhookSettings } from '@/services/webhookService';
import { parseWebhookResponse, ElevatorPitch } from '@/utils/webhookResponseParser';
import { Separator } from '@/components/ui/separator';
import { callMyBusinessWebhook } from '@/services/myBusinessWebhookService';
import { ContactInfo } from '@/types/company';
import { Globe, Mail, Phone, User } from 'lucide-react';

interface BusinessData {
  elevatorPitch?: ElevatorPitch;
  contactInfo?: ContactInfo;
}

const MyBusiness = () => {
  const { user, userProfile, updateProfile } = useAuth();
  const [websiteUrl, setWebsiteUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [businessData, setBusinessData] = useState<BusinessData | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [webhookUrl, setWebhookUrl] = useState<string>('');

  useEffect(() => {
    if (userProfile?.website_url) {
      setWebsiteUrl(userProfile.website_url);
    }
  }, [userProfile?.website_url]);

  useEffect(() => {
    const loadWebhookSettings = async () => {
      try {
        const settings = await fetchWebhookSettings();
        if (settings && settings.mybusiness_url) {
          console.log('Loaded My Business webhook URL:', settings.mybusiness_url);
          setWebhookUrl(settings.mybusiness_url);
        } else {
          console.warn('No My Business webhook URL configured in settings');
          setWebhookUrl('https://agent.froste.eu/webhook/mybusiness');
        }
      } catch (error) {
        console.error('Error loading webhook settings:', error);
        setWebhookUrl('https://agent.froste.eu/webhook/mybusiness');
      }
    };

    loadWebhookSettings();
    
    if (userProfile?.business_data) {
      const savedData: BusinessData = {
        elevatorPitch: userProfile.business_data.elevator_pitch,
        contactInfo: userProfile.business_data.contact_info
      };
      
      setBusinessData(savedData);
      console.log('Loaded saved business data:', savedData);
    }
  }, [userProfile]);

  const handleAnalyzeWebsite = async () => {
    if (!websiteUrl) {
      toast({
        title: "Error",
        description: "Please enter a website URL",
        variant: "destructive",
      });
      return;
    }

    if (!webhookUrl) {
      toast({
        title: "Error",
        description: "Webhook URL is not configured",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log(`Calling my business webhook: ${webhookUrl}`);
      console.log(`With website: ${websiteUrl}`);
      
      const response = await callMyBusinessWebhook(webhookUrl, websiteUrl);
      
      if (!response.ok) {
        throw new Error(`Webhook request failed: ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log('Raw webhook response:', responseData);
      
      const parsedData = parseWebhookResponse(responseData);
      console.log('Parsed data:', parsedData);
      
      const newBusinessData: BusinessData = {
        elevatorPitch: parsedData.elevatorPitch,
        contactInfo: parsedData.contactInfo
      };
      
      setBusinessData(newBusinessData);
      
      if (user && websiteUrl !== userProfile?.website_url) {
        await updateProfile({ website_url: websiteUrl });
      }

      toast({
        title: "Success",
        description: "Your business website has been analyzed",
      });
    } catch (error) {
      console.error('Error analyzing website:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to analyze your business website. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveBusinessData = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      await updateProfile({ 
        business_data: {
          elevator_pitch: businessData?.elevatorPitch,
          contact_info: businessData?.contactInfo
        }
      });
      
      toast({
        title: "Success",
        description: "Your business information has been saved",
      });
    } catch (error) {
      console.error('Error saving business info:', error);
      toast({
        title: "Error",
        description: "Failed to save your business information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const CompanyHeader = ({ elevatorPitch }: { elevatorPitch?: ElevatorPitch }) => {
    if (!elevatorPitch) return null;
    
    return (
      <div className="text-center py-8 px-4 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-t-lg">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white">
          {elevatorPitch.company_name}
        </h1>
        <p className="mt-2 text-lg md:text-xl italic text-slate-600 dark:text-slate-300">
          {elevatorPitch.tagline}
        </p>
      </div>
    );
  };
  
  const CompanyIntroduction = ({ elevatorPitch }: { elevatorPitch?: ElevatorPitch }) => {
    if (!elevatorPitch) return null;
    
    return (
      <div className="py-6 px-6 md:px-8">
        <p className="text-base md:text-lg text-center max-w-3xl mx-auto text-slate-700 dark:text-slate-200">
          {elevatorPitch.about}
        </p>
      </div>
    );
  };
  
  const ServicesSection = ({ services }: { services?: ElevatorPitch['services'] }) => {
    if (!services || services.length === 0) return null;
    
    return (
      <div className="py-8 px-6 md:px-8 bg-white dark:bg-slate-800/50">
        <h2 className="text-2xl font-semibold text-center mb-6 text-slate-800 dark:text-white">Our Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service, index) => (
            <div 
              key={index} 
              className="p-5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-medium mb-2 text-slate-800 dark:text-white">{service.name}</h3>
              <p className="text-slate-600 dark:text-slate-300">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  const TestimonialsSection = ({ testimonials }: { testimonials?: ElevatorPitch['testimonials'] }) => {
    if (!testimonials || testimonials.length === 0) return null;
    
    return (
      <div className="py-8 px-6 md:px-8 bg-slate-50 dark:bg-slate-800/30">
        <h2 className="text-2xl font-semibold text-center mb-6 text-slate-800 dark:text-white">What Our Clients Say</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="p-5 rounded-lg bg-white dark:bg-slate-800 shadow-sm">
              <p className="italic text-slate-600 dark:text-slate-300 mb-4">"{testimonial.testimonial}"</p>
              <div className="flex items-center">
                <div>
                  <p className="font-medium text-slate-800 dark:text-white">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {testimonial.position}{testimonial.company ? `, ${testimonial.company}` : ''}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  const ClientsSection = ({ clients }: { clients?: string[] }) => {
    if (!clients || clients.length === 0) return null;
    
    return (
      <div className="py-8 px-6 md:px-8">
        <h2 className="text-2xl font-semibold text-center mb-6 text-slate-800 dark:text-white">Our Clients</h2>
        <div className="flex flex-wrap justify-center gap-3">
          {clients.map((client, index) => (
            <span 
              key={index} 
              className="px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-700 dark:text-slate-200"
            >
              {client}
            </span>
          ))}
        </div>
      </div>
    );
  };
  
  const ValueProposition = ({ valueProposition }: { valueProposition?: string }) => {
    if (!valueProposition) return null;
    
    return (
      <div className="py-8 px-6 md:px-8 text-center">
        <div className="p-6 rounded-lg bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold mb-3 text-slate-800 dark:text-white">Our Value</h2>
          <p className="text-lg text-slate-800 dark:text-white">{valueProposition}</p>
        </div>
      </div>
    );
  };
  
  const ContactSection = ({ contactInfo }: { contactInfo?: ContactInfo }) => {
    if (!contactInfo) return null;
    
    return (
      <div className="py-8 px-6 md:px-8 bg-white dark:bg-slate-800/50 rounded-b-lg">
        <h2 className="text-2xl font-semibold text-center mb-6 text-slate-800 dark:text-white">Contact Us</h2>
        <div className="max-w-md mx-auto space-y-4">
          {contactInfo.email && contactInfo.email !== "Not Found" && (
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-blue-500" />
              <span className="text-slate-700 dark:text-slate-200">{contactInfo.email}</span>
            </div>
          )}
          {contactInfo.phone && contactInfo.phone !== "Not Found" && (
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-green-500" />
              <span className="text-slate-700 dark:text-slate-200">{contactInfo.phone}</span>
            </div>
          )}
          {contactInfo.contact && contactInfo.contact !== "Not Found" && (
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-purple-500" />
              <span className="text-slate-700 dark:text-slate-200">{contactInfo.contact}</span>
            </div>
          )}
          {contactInfo.www && contactInfo.www !== "Not Found" && (
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-orange-500" />
              <a 
                href={contactInfo.www} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {contactInfo.www.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Business Profile</CardTitle>
          {businessData?.elevatorPitch?.company_name && (
            <CardDescription>
              Showing business profile for {businessData.elevatorPitch.company_name}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="websiteUrl">Your Business Website</Label>
              <div className="flex gap-2">
                <Input
                  id="websiteUrl"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://yourbusiness.com"
                  className="flex-1"
                />
                <Button 
                  onClick={handleAnalyzeWebsite} 
                  disabled={isLoading}
                >
                  {isLoading ? "Analyzing..." : "Analyze"}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Enter your business website URL to generate a business profile
              </p>
            </div>

            {businessData && (
              <div className="mt-8 overflow-hidden rounded-lg border shadow">
                <div className="business-mini-homepage">
                  <CompanyHeader elevatorPitch={businessData.elevatorPitch} />
                  <CompanyIntroduction elevatorPitch={businessData.elevatorPitch} />
                  
                  {businessData.elevatorPitch?.services && businessData.elevatorPitch.services.length > 0 && (
                    <>
                      <Separator />
                      <ServicesSection services={businessData.elevatorPitch?.services} />
                    </>
                  )}
                  
                  {businessData.elevatorPitch?.value_proposition && (
                    <>
                      <Separator />
                      <ValueProposition valueProposition={businessData.elevatorPitch?.value_proposition} />
                    </>
                  )}
                  
                  {businessData.elevatorPitch?.testimonials && businessData.elevatorPitch.testimonials.length > 0 && (
                    <>
                      <Separator />
                      <TestimonialsSection testimonials={businessData.elevatorPitch?.testimonials} />
                    </>
                  )}
                  
                  {businessData.elevatorPitch?.clients && businessData.elevatorPitch.clients.length > 0 && (
                    <>
                      <Separator />
                      <ClientsSection clients={businessData.elevatorPitch?.clients} />
                    </>
                  )}
                  
                  {businessData.contactInfo && (
                    <>
                      <Separator />
                      <ContactSection contactInfo={businessData.contactInfo} />
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
        {businessData && (
          <CardFooter>
            <Button 
              onClick={handleSaveBusinessData} 
              disabled={isSaving}
              className="ml-auto"
            >
              {isSaving ? "Saving..." : "Save Business Profile"}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default MyBusiness;
