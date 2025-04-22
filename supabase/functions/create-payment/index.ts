
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    const { priceId } = await req.json();
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Determine product details based on priceId
    let productName = "";
    let productDescription = "";
    let unitAmount = 0;
    let currency = "eur";
    
    if (priceId === "price_1RGoUuHTXSpIB5InGhmQ7gdn") {
      productName = "5 Credits Package";
      productDescription = "Purchase of 5 credits for company searches";
      unitAmount = 500; // €5.00
    } else if (priceId === "price_1RGobkHTXSpIB5Iny2gg7sQv") {
      productName = "25 Credits Package";
      productDescription = "Purchase of 25 credits for company searches";
      unitAmount = 2000; // €20.00
    } else {
      throw new Error("Invalid price ID");
    }

    console.log(`Creating Stripe checkout for price ID: ${priceId}`);
    console.log(`Product details: ${productName} - ${productDescription}`);

    // Create checkout session with explicit line item details instead of just using priceId
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: currency,
            unit_amount: unitAmount,
            product_data: {
              name: productName,
              description: productDescription,
            },
          },
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/profile?payment_success=true`,
      cancel_url: `${req.headers.get("origin")}/profile?payment_cancelled=true`,
      client_reference_id: user.id,
      metadata: {
        user_id: user.id,
        product_name: productName,
        product_description: productDescription,
        price_id: priceId // Store original priceId for reference in webhook
      },
    });

    console.log(`Stripe checkout session created: ${session.id}, redirecting to ${session.url}`);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error('Error creating Stripe checkout:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
