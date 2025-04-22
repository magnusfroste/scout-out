
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import CreditDisplay from "@/components/dashboard/CreditDisplay";

interface CreditSectionProps {
  credits: number;
}

const CreditSection: React.FC<CreditSectionProps> = ({ credits }) => (
  <Card>
    <CardHeader>
      <CardTitle>Credits</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex flex-col items-center md:flex-row md:justify-between space-y-4 md:space-y-0">
        <div className="flex items-center space-x-3">
          <CreditDisplay credits={credits} size="lg" />
          <span className="text-sm text-muted-foreground">Available for searches</span>
        </div>
        <div className="text-sm text-muted-foreground">
          <ul className="list-disc pl-5 space-y-1">
            <li>1 credit = 10 questions per search</li>
            <li>Unused credits never expire</li>
            <li>New accounts start with 5 credits</li>
          </ul>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default CreditSection;
