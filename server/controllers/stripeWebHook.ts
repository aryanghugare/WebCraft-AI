import { Request, Response } from 'express';
import Stripe from 'stripe';
import prisma from '../lib/prisma.js';



// From the stripe documentation
export const stripeWebhook = async (request: Request, response: Response)=>{
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

  if (endpointSecret) {
    // Get the signature sent by Stripe
    const signature = request.headers['stripe-signature'] as string;

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        request.body,
        signature,
        endpointSecret
      );
    } catch (err: any) {
      console.log(`⚠️ Webhook signature verification failed.`, err.message);
      return response.sendStatus(400);
    }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      const sessionList = await stripe.checkout.sessions.list({
        payment_intent: paymentIntent.id
      })

      const session = sessionList.data[0];
   // Meta data was added by me while creating the session in the controller
      const {transactionId, appId} = (session?.metadata ?? {}) as {transactionId?: string; appId?: string}

      if(appId === 'ai-site-builder' && transactionId){
       // Payment is successful here.
       // Stripe can deliver the same event more than once, so credits are added
       // only when this call is the one that flips the transaction from unpaid to paid.
        await prisma.$transaction(async (tx) => {
          const { count } = await tx.transaction.updateMany({
              where: {id: transactionId, isPaid: false},
              data: {isPaid: true}
          })

          // Already paid: a duplicate delivery, so don't add credits again
          if (count === 0) return;

          const transaction = await tx.transaction.findUniqueOrThrow({
              where: {id: transactionId}
          })

          // Add the credits to the user data
          await tx.user.update({
              where: {id: transaction.userId},
              data: {credits: {increment: transaction.credits}}
          })
        })
      }
      break;
    
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  response.json({received: true});
}
}
