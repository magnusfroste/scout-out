
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

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!stripeKey || !stripeWebhookSecret) {
    return new Response(JSON.stringify({ error: "Missing Stripe configuration" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    const event = stripe.webhooks.constructEvent(
      body,
      signature || '',
      stripeWebhookSecret
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.metadata?.user_id;
      const priceId = session.line_items?.data[0]?.price?.id;

      if (userId) {
        let creditAmount = 0;
        let description = '';

        // Determine credit amount based on price ID
        switch(priceId) {
          case 'price_1RGoUuHTXSpIB5InGhmQ7gdn':
            creditAmount = 5;
            description = 'Purchased 5 credits';
            break;
          case 'price_1RGobkHTXSpIB5Iny2gg7sQv':
            creditAmount = 25;
            description = 'Purchased 25 credits';
            break;
        }

        // Update user's credits
        const { data: profileData, error: profileError } = await supabaseClient
          .from('profiles')
          .select('credits')
          .eq('id', userId)
          .single();

        if (profileError) throw profileError;

        const updatedCredits = (profileData.credits || 0) + creditAmount;

        await supabaseClient
          .from('profiles')
          .update({ credits: updatedCredits })
          .eq('id', userId);

        // Log credit transaction
        await supabaseClient
          .from('credit_transactions')
          .insert({
            user_id: userId,
            amount: creditAmount,
            description: description
          });

        console.log(`Credits updated for user ${userId}: added ${creditAmount} credits. New total: ${updatedCredits}`);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    console.error('Webhook Error:', err);
    return new Response(JSON.stringify({ error: `Webhook Error: ${err.message}` }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
