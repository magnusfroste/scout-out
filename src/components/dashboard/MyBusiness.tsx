
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { fetchWebhookSettings } from '@/services/webhookService';
import { parseWebhookResponse, ElevatorPitch } from '@/utils/webhookResponseParser';
import { Separator } from '@/components/ui/separator';
import { callMyBusinessWebhook } from '@/services/myBusinessWebhookService';
import { ContactInfo } from '@/types/company';

interface BusinessData {
  summary: string;
  salesInfo: string;
  elevatorPitch?: ElevatorPitch;
  contactInfo?: ContactInfo;
}

const MyBusiness = () => {
  const { user, userProfile, updateProfile } = useAuth();
  const [websiteUrl, setWebsiteUrl] = useState<string>(userProfile?.website_url || '');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [businessData, setBusinessData] = useState<BusinessData | null>(null);
  const [salesInfo, setSalesInfo] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [webhookUrl, setWebhookUrl] = useState<string>('');

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
    
    // Load saved business data if available
    if (userProfile?.business_data) {
      const savedData: BusinessData = {
        summary: '',
        salesInfo: userProfile.sales_info || '',
        elevatorPitch: userProfile.business_data.elevator_pitch,
        contactInfo: userProfile.business_data.contact_info
      };
      
      // Reconstruct summary from saved data if available
      if (savedData.elevatorPitch) {
        const ep = savedData.elevatorPitch;
        const introduction = ep.introduction || ep.overview || '';
        const valueProposition = ep.value_proposition || ep.client_value || '';
        savedData.summary = `${ep.company_name}: ${ep.tagline}\n\n${introduction}\n\n${valueProposition}`;
      }
      
      setBusinessData(savedData);
      setSalesInfo(savedData.salesInfo);
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
        summary: '',
        salesInfo: '',
        elevatorPitch: parsedData.elevatorPitch,
        contactInfo: parsedData.contactInfo
      };
      
      if (parsedData.elevatorPitch) {
        const ep = parsedData.elevatorPitch;
        
        // Use either introduction or overview field
        const introduction = ep.introduction || ep.overview || '';
        const valueProposition = ep.value_proposition || ep.client_value || '';
        
        newBusinessData.summary = `${ep.company_name}: ${ep.tagline}\n\n${introduction}\n\n${valueProposition}`;
        
        let servicesText = "Our Services:\n";
        if (ep.services && Array.isArray(ep.services)) {
          ep.services.forEach(service => {
            servicesText += `- ${service.name}: ${service.description}\n`;
          });
        }
        
        let testimonialsText = "\nWhat Our Clients Say:\n";
        if (ep.client_testimonials && Array.isArray(ep.client_testimonials)) {
          ep.client_testimonials.forEach(testimonial => {
            const quote = testimonial.feedback || testimonial.quote || '';
            const name = testimonial.client_name || testimonial.name || '';
            testimonialsText += `"${quote}" - ${name}, ${testimonial.title} at ${testimonial.company}\n\n`;
          });
        }
        
        newBusinessData.salesInfo = servicesText + testimonialsText + (ep.call_to_action ? `\n${ep.call_to_action}` : '');
      }
      
      setBusinessData(newBusinessData);
      setSalesInfo(newBusinessData.salesInfo);
      
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

  const handleSaveSalesInfo = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      // Save both sales info text and complete business data
      await updateProfile({ 
        sales_info: salesInfo,
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

  const renderElevatorPitch = () => {
    if (!businessData?.elevatorPitch) return null;
    
    const ep = businessData.elevatorPitch;
    const introduction = ep.introduction || ep.overview || '';
    const valueProposition = ep.value_proposition || ep.client_value || '';
    const clientNames = ep.client_names || ep.notable_clients || [];
    
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">{ep.company_name}</h3>
          <p className="text-lg font-medium italic">{ep.tagline}</p>
          <p className="text-sm text-muted-foreground">{introduction}</p>
        </div>
        
        <div className="space-y-2">
          <h4 className="text-lg font-medium">Services</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ep.services && ep.services.map((service, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <h5 className="font-semibold">{service.name}</h5>
                <p className="text-sm">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <h4 className="text-lg font-medium">Value Proposition</h4>
          <p className="text-sm">{valueProposition}</p>
        </div>
        
        {clientNames && clientNames.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-lg font-medium">Clients</h4>
            <div className="flex flex-wrap gap-2">
              {clientNames.map((client, index) => (
                <span key={index} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-sm">
                  {client}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {ep.client_testimonials && ep.client_testimonials.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-lg font-medium">Testimonials</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ep.client_testimonials.map((testimonial, index) => (
                <div key={index} className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-800">
                  <p className="text-sm italic">"{testimonial.feedback || testimonial.quote}"</p>
                  <p className="text-sm font-medium mt-2">
                    {testimonial.client_name || testimonial.name}, {testimonial.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{testimonial.company}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {ep.call_to_action && (
          <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg border-l-4 border-blue-500 mt-4">
            <p className="font-medium text-center">{ep.call_to_action}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Business Analysis</CardTitle>
          {userProfile?.business_data?.elevator_pitch && (
            <CardDescription>
              Showing saved business profile for {userProfile.business_data.elevator_pitch.company_name}
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
                Enter your business website URL to generate a summary and sales information
              </p>
            </div>

            {businessData && (
              <div className="space-y-6 mt-6">
                {businessData.elevatorPitch && (
                  <>
                    <h3 className="text-xl font-semibold">Business Profile</h3>
                    {renderElevatorPitch()}
                    <Separator className="my-4" />
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="salesInfo">Sales Information</Label>
                  <p className="text-sm text-muted-foreground">
                    Review and edit the generated sales information before saving
                  </p>
                  <Textarea
                    id="salesInfo"
                    value={salesInfo}
                    onChange={(e) => setSalesInfo(e.target.value)}
                    rows={6}
                    className="resize-none"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
        {businessData && (
          <CardFooter>
            <Button 
              onClick={handleSaveSalesInfo} 
              disabled={isSaving}
              className="ml-auto"
            >
              {isSaving ? "Saving..." : "Save Business Information"}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default MyBusiness;
