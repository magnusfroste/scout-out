import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { parseWebhookResponse, ElevatorPitch } from '@/utils/webhookResponseParser';
import { Separator } from '@/components/ui/separator';
import { callMyBusinessWebhook } from '@/services/myBusinessWebhookService';
import { ContactInfo } from '@/types/company';
import { Globe, Mail, Phone, User, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface BusinessData {
  elevatorPitch?: ElevatorPitch;
  contactInfo?: ContactInfo;
  autoSaved?: boolean;
}

const MyBusiness = () => {
  const { user, userProfile, updateProfile } = useAuth();
  const [websiteUrl, setWebsiteUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [businessData, setBusinessData] = useState<BusinessData | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);
  const [methodUsed, setMethodUsed] = useState<string>('');

  useEffect(() => {
    if (userProfile?.website_url) {
      setWebsiteUrl(userProfile.website_url);
    }
    setIsLoadingProfile(false);
  }, [userProfile?.website_url]);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userProfile?.business_data) {
      const savedData: BusinessData = {
        elevatorPitch: userProfile.business_data.elevator_pitch,
        contactInfo: userProfile.business_data.contact_info,
        autoSaved: true
      };
      
      setBusinessData(savedData);
      console.log('Loaded saved business data:', savedData);
    } else {
      setBusinessData(null);
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

    setIsLoading(true);
    setBusinessData(null); // Clear previous data while loading
    
    try {
      console.log('Calling my business webhook via edge function');
      console.log(`With website: ${websiteUrl}`);
      
      toast({
        title: "Processing",
        description: "Analyzing your business website. This may take a moment...",
      });
      
      const response = await callMyBusinessWebhook('', websiteUrl);
      
      if (!response.ok) {
        throw new Error(`Service temporarily unavailable`);
      }
      
      // Clone the response before reading the body
      const responseClone = response.clone();
      let responseData;
      
      try {
        responseData = await response.json();
      } catch (error) {
        console.error('Error parsing response JSON:', error);
        // Try to get response as text if JSON parsing fails
        const textResponse = await responseClone.text();
        console.log('Response as text:', textResponse);
        throw new Error('Invalid response format from service');
      }
      
      console.log('Raw webhook response:', responseData);
      
      // Check if the response contains method information
      if (responseData.method) {
        setMethodUsed(responseData.method);
        console.log('Method used:', responseData.method);
        
        // Show a success toast with the method used
        toast({
          title: "Success",
          description: `Your business website has been analyzed using: ${responseData.method}`,
        });
      } else {
        setMethodUsed('Direct Webhook');
        console.log('Method used: Direct Webhook (inferred)');
        
        // Show a success toast with the method used
        toast({
          title: "Success",
          description: "Your business website has been analyzed using: Direct Webhook",
        });
      }
      
      const parsedData = parseWebhookResponse(responseData);
      console.log('Parsed data:', parsedData);
      
      const newBusinessData: BusinessData = {
        elevatorPitch: parsedData.elevatorPitch,
        contactInfo: parsedData.contactInfo,
        autoSaved: false
      };
      
      // Update state with the new data immediately to display it
      setBusinessData(newBusinessData);
      
      // Save data to profile automatically
      if (user) {
        try {
          // First, save the website URL if it has changed
          if (websiteUrl !== userProfile?.website_url) {
            await updateProfile({ website_url: websiteUrl });
          }
          
          // Then save the business data regardless
          await updateProfile({ 
            business_data: {
              elevator_pitch: newBusinessData?.elevatorPitch,
              contact_info: newBusinessData?.contactInfo
            }
          });
          
          console.log('Business data saved automatically');
          
          // Add a note to the success toast
          toast({
            title: "Success",
            description: "Your business website has been analyzed and profile saved automatically",
          });
        } catch (saveError) {
          console.error('Error saving business data automatically:', saveError);
          toast({
            title: "Note",
            description: "Profile generated but couldn't be saved automatically. Please use the Save button.",
            variant: "default",
          });
        }
      } else {
        toast({
          title: "Success",
          description: "Your business website has been analyzed and profile generated",
        });
      }
    } catch (error) {
      console.error('Error analyzing website:', error);
      toast({
        title: "Error",
        description: "Failed to analyze your business website. Please try again later.",
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
      
      setBusinessData({
        ...businessData,
        autoSaved: true
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

  const handleResetBusinessData = async () => {
    if (!user) return;
    
    setIsResetting(true);
    try {
      await updateProfile({ 
        business_data: null,
        website_url: null
      });
      
      setBusinessData(null);
      setWebsiteUrl('');
      
      toast({
        title: "Success",
        description: "Your business profile has been reset. You can now try with a different website.",
      });
    } catch (error) {
      console.error('Error resetting business data:', error);
      toast({
        title: "Error",
        description: "Failed to reset your business profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
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
        <h2 className="text-2xl font-semibold text-center mb-6 text-slate-800 dark:text-white">Solutions to Client Challenges</h2>
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
        <h2 className="text-2xl font-semibold text-center mb-6 text-slate-800 dark:text-white">Client Success Stories</h2>
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
        <h2 className="text-2xl font-semibold text-center mb-6 text-slate-800 dark:text-white">Clients</h2>
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
          <h2 className="text-2xl font-semibold mb-3 text-slate-800 dark:text-white">Unique Value Proposition</h2>
          <p className="text-lg text-slate-800 dark:text-white">{valueProposition}</p>
        </div>
      </div>
    );
  };
  
  const ContactSection = ({ contactInfo }: { contactInfo?: ContactInfo }) => {
    if (!contactInfo) return null;
    
    return (
      <div className="py-8 px-6 md:px-8 bg-white dark:bg-slate-800/50 rounded-b-lg">
        <h2 className="text-2xl font-semibold text-center mb-6 text-slate-800 dark:text-white">Connect With Us</h2>
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
  
  const LoadingBusinessProfile = () => {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-12 border rounded-lg bg-background/50">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <div className="text-center">
          <h3 className="text-lg font-medium">ScoutOut is analyzing your business</h3>
          <p className="text-muted-foreground">This may take a minute or two...</p>
        </div>
      </div>
    );
  };

  const renderBusinessProfile = () => {
    if (isLoading) {
      return <LoadingBusinessProfile />;
    }
    
    if (!businessData) {
      return (
        <div className="flex flex-col items-center justify-center py-12 px-6 border border-dashed rounded-lg bg-muted/20">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Globe className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-center">Create your business profile</h3>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            Enter your website URL above and click "Generate Profile" to create a profile that helps our AI understand your business and create better value propositions.
          </p>
          <p className="text-xs text-muted-foreground text-center max-w-sm">
            Tip: Your business profile is used to create personalized and relevant value propositions for potential customers.
          </p>
        </div>
      );
    }

    return (
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
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Business Profile</CardTitle>
              {businessData?.elevatorPitch?.company_name ? (
                <CardDescription>
                  Profile for {businessData.elevatorPitch.company_name} that highlights client challenges and your solutions
                </CardDescription>
              ) : (
                <CardDescription>
                  Generate a company profile that emphasizes how you solve client challenges
                </CardDescription>
              )}
            </div>
            
            {businessData && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <RefreshCw className="h-4 w-4" />
                    Reset
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reset Business Profile</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will clear all your business profile data and allow you to start fresh with a different website URL.
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleResetBusinessData}
                      disabled={isResetting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isResetting ? 'Resetting...' : 'Reset Profile'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingProfile ? (
            <div className="flex justify-center items-center py-4">
              <div className="animate-pulse text-muted-foreground">Loading business tools...</div>
            </div>
          ) : (
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
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : "Generate Profile"}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Enter your business website URL to generate a comprehensive profile that highlights client challenges and your solutions
                </p>
              </div>

              {renderBusinessProfile()}
            </div>
          )}
        </CardContent>
        {businessData && !isLoadingProfile && (
          <CardFooter>
            {!businessData.autoSaved && (
              <Button 
                onClick={handleSaveBusinessData}
                disabled={isSaving || !businessData || isLoading}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>Save Changes</>
                )}
              </Button>
            )}
          </CardFooter>
        )}
        
        {methodUsed && (
          <div className="mt-4 mb-2 p-2 bg-muted rounded-md border border-border">
            <p className="text-sm text-center font-medium">
              Method used: <span className="font-mono bg-background px-2 py-1 rounded">{methodUsed}</span>
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default MyBusiness;
