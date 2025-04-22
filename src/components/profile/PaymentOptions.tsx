
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PaymentOptionsProps {
  isLoading: boolean;
  onTopUp: (priceId: string) => void;
}

const PaymentOptions: React.FC<PaymentOptionsProps> = ({
  isLoading,
  onTopUp,
}) => (
  <Card>
    <CardHeader>
      <CardTitle>Top Up Credits</CardTitle>
    </CardHeader>
    <CardContent className="flex gap-4">
      <div className="flex flex-col items-center p-4 border rounded">
        <p>5 Credits</p>
        <Button
          onClick={() => onTopUp("price_1RGoUuHTXSpIB5InGhmQ7gdn")}
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : "Buy 5 Credits - €5"}
        </Button>
      </div>
      <div className="flex flex-col items-center p-4 border rounded">
        <p>25 Credits</p>
        <Button
          onClick={() => onTopUp("price_1RGobkHTXSpIB5Iny2gg7sQv")}
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : "Buy 25 Credits - €20"}
        </Button>
      </div>
    </CardContent>
  </Card>
);

export default PaymentOptions;
