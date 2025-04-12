
/**
 * Mock response generator for value proposition service in development
 */

// Mock response for testing in development
export const getMockValuePropositionResponse = (
  companyData: any, 
  businessData: any, 
  additionalData: any, 
  userInfo: any
) => {
  console.log('MOCK MODE: Generating mock value proposition data');
  console.log('Additional data:', additionalData);
  console.log('User info:', userInfo);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ok: true,
        json: () => Promise.resolve({
          score: Math.floor(Math.random() * 5) + 1, // Random score between 1-5
          advice: `Based on our analysis, ${companyData.company_name} would be a great fit for your business. Their ${companyData.result?.industry || 'business'} aligns well with your products and services. We recommend highlighting your experience in this sector.`,
          introduction: `Hello ${companyData.contact || 'there'},\n\nI'm reaching out from ${businessData?.name || 'our company'} where we specialize in ${businessData?.description || 'our services'}. I recently came across ${companyData.company_name} and was impressed by your work in ${companyData.result?.industry || 'your industry'}.\n\nI believe we could help you with ${businessData?.value_proposition || 'improving your business'}.\n\nWould you be open to a brief conversation next week to explore potential synergies?\n\nBest regards,\n${userInfo?.first_name || 'Your Name'} ${userInfo?.last_name || ''}`,
          subject: `Introduction from ${businessData?.name || 'our company'}`
        })
      });
    }, 1500);
  });
};
