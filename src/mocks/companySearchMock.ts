import { SearchResultType } from '@/types/company';

// Mock response data for different companies in the format expected by the webhook response parser
export const mockCompanyResponses: Record<string, any> = {
  'Apple': [
    {
      output: {
        Company: {
          www: "https://www.apple.com",
          contact: "Investor Relations",
          email: "investor_relations@apple.com",
          phone: "+1 (408) 996-1010"
        },
        Questions: [
          {
            id: "8d63f976-cdd7-4db4-8cf2-d3b69cd70903",
            answer: "Apple Inc. is an American multinational technology company headquartered in Cupertino, California. They design, develop, and sell consumer electronics, computer software, and online services."
          },
          {
            id: "9b1bddb8-c4f7-4bba-8c72-bfd6d670347b",
            answer: "Apple was founded in 1976 by Steve Jobs, Steve Wozniak, and Ronald Wayne. The company went public in 1980 and has since become one of the world's most valuable companies."
          },
          {
            id: "3bd44337-3212-4a60-a418-eb45677e0478",
            answer: "Apple's revenue in 2023 was approximately $383 billion, with a net income of around $97 billion. The company employs over 150,000 people worldwide."
          }
        ]
      }
    }
  ],
  'Microsoft': [
    {
      output: {
        Company: {
          www: "https://www.microsoft.com",
          contact: "Investor Relations",
          email: "msft@microsoft.com",
          phone: "+1 (425) 882-8080"
        },
        Questions: [
          {
            id: "8d63f976-cdd7-4db4-8cf2-d3b69cd70903",
            answer: "Microsoft Corporation is an American multinational technology company headquartered in Redmond, Washington. They develop, manufacture, license, support, and sell computer software, consumer electronics, personal computers, and related services."
          },
          {
            id: "9b1bddb8-c4f7-4bba-8c72-bfd6d670347b",
            answer: "Microsoft was founded by Bill Gates and Paul Allen on April 4, 1975. Satya Nadella is the current CEO, taking over from Steve Ballmer in 2014."
          },
          {
            id: "3bd44337-3212-4a60-a418-eb45677e0478",
            answer: "Microsoft's revenue in 2023 was approximately $212 billion, with a net income of around $72 billion. The company employs over 180,000 people worldwide."
          }
        ]
      }
    }
  ],
  'Tesla': [
    {
      output: {
        Company: {
          www: "https://www.tesla.com",
          contact: "Investor Relations",
          email: "ir@tesla.com",
          phone: "+1 (888) 518-3752"
        },
        Questions: [
          {
            id: "8d63f976-cdd7-4db4-8cf2-d3b69cd70903",
            answer: "Tesla, Inc. is an American electric vehicle and clean energy company based in Austin, Texas. Tesla designs and manufactures electric cars, battery energy storage from home to grid-scale, solar panels and solar roof tiles, and related products and services."
          },
          {
            id: "9b1bddb8-c4f7-4bba-8c72-bfd6d670347b",
            answer: "Tesla was founded in 2003 by Martin Eberhard and Marc Tarpenning. Elon Musk joined the company in 2004 as chairman and became CEO in 2008."
          },
          {
            id: "3bd44337-3212-4a60-a418-eb45677e0478",
            answer: "Tesla's revenue in 2023 was approximately $96 billion, with a net income of around $15 billion. The company employs over 100,000 people worldwide."
          }
        ]
      }
    }
  ],
  'Google': [
    {
      output: {
        Company: {
          www: "https://www.google.com",
          contact: "Investor Relations",
          email: "investor-relations@abc.xyz",
          phone: "+1 (650) 253-0000"
        },
        Questions: [
          {
            id: "8d63f976-cdd7-4db4-8cf2-d3b69cd70903",
            answer: "Google LLC is an American multinational technology company that specializes in Internet-related services and products, which include online advertising technologies, a search engine, cloud computing, software, and hardware."
          },
          {
            id: "9b1bddb8-c4f7-4bba-8c72-bfd6d670347b",
            answer: "Google was founded by Larry Page and Sergey Brin while they were Ph.D. students at Stanford University in 1998. The company went public in 2004 and underwent a restructuring in 2015, becoming a subsidiary of Alphabet Inc."
          },
          {
            id: "3bd44337-3212-4a60-a418-eb45677e0478",
            answer: "Google's parent company Alphabet reported revenue of approximately $307 billion in 2023, with a net income of around $73 billion. The company employs over 180,000 people worldwide."
          }
        ]
      }
    }
  ]
};

// Default mock response for companies not in the list
export const defaultMockResponse = [
  {
    output: {
      Company: {
        www: "https://www.example.com",
        contact: "Customer Service",
        email: "info@example.com",
        phone: "+1 (555) 123-4567"
      },
      Questions: [
        {
          id: "8d63f976-cdd7-4db4-8cf2-d3b69cd70903",
          answer: "This is a mock response for a company search. In a real environment, this would contain actual data about the company."
        },
        {
          id: "9b1bddb8-c4f7-4bba-8c72-bfd6d670347b",
          answer: "This is simulated data for testing purposes. The actual data would come from the webhook service."
        },
        {
          id: "3bd44337-3212-4a60-a418-eb45677e0478",
          answer: "Mock data is useful for development and testing without incurring API costs or hitting rate limits."
        }
      ]
    }
  }
];

// Function to get mock response with a delay to simulate network request
export const getMockResponse = async (companyName: string): Promise<any> => {
  console.log('MOCK: Starting mock response generation for company:', companyName);
  
  // Log the start time
  const startTime = new Date();
  console.log('MOCK: Search started at:', startTime.toISOString());
  
  // Simulate network delay
  const delayMs = 2000;
  console.log(`MOCK: Simulating network delay of ${delayMs}ms...`);
  await new Promise(resolve => setTimeout(resolve, delayMs));
  
  // Convert company name to lowercase for case-insensitive matching
  const normalizedName = companyName.toLowerCase();
  console.log('MOCK: Normalized company name for search:', normalizedName);
  
  // Check for partial matches in our mock data
  let matchFound = false;
  let matchedCompany = '';
  let response;
  
  console.log('MOCK: Searching for company matches in mock database...');
  for (const [company, data] of Object.entries(mockCompanyResponses)) {
    if (normalizedName.includes(company.toLowerCase()) || 
        company.toLowerCase().includes(normalizedName)) {
      matchFound = true;
      matchedCompany = company;
      response = data;
      console.log(`MOCK: Match found! Using data for "${company}"`);
      break;
    }
  }
  
  // If no match found, use default response
  if (!matchFound) {
    console.log('MOCK: No specific match found, using default mock response');
    response = defaultMockResponse;
  }
  
  // Log the end time and duration
  const endTime = new Date();
  const duration = endTime.getTime() - startTime.getTime();
  console.log(`MOCK: Search completed at ${endTime.toISOString()}, took ${duration}ms`);
  console.log('MOCK: Returning mock response data:', response ? 'Data available' : 'No data');
  
  // Return the response in the format expected by the webhook service
  return {
    ok: true,
    json: async () => {
      console.log(`MOCK: JSON data requested for ${matchFound ? matchedCompany : 'unknown company'}`);
      return response;
    }
  };
};

// Function to simulate a failed request
export const getMockErrorResponse = async (): Promise<any> => {
  console.log('MOCK ERROR: Simulating error response');
  
  // Log the start time
  const startTime = new Date();
  console.log('MOCK ERROR: Error simulation started at:', startTime.toISOString());
  
  // Simulate network delay before error
  const delayMs = 1500;
  console.log(`MOCK ERROR: Simulating network delay of ${delayMs}ms before error...`);
  await new Promise(resolve => setTimeout(resolve, delayMs));
  
  // Log the end time and duration
  const endTime = new Date();
  const duration = endTime.getTime() - startTime.getTime();
  console.log(`MOCK ERROR: Error simulation completed at ${endTime.toISOString()}, took ${duration}ms`);
  console.log('MOCK ERROR: Returning error response with status 500');
  
  return {
    ok: false,
    status: 500,
    statusText: 'Internal Server Error'
  };
};
