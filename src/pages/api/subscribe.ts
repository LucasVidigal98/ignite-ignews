import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from 'next-auth/react';
import { query as q } from 'faunadb';

import { stripe } from '../../services/stripe';
import { fauna } from '../../services/fauna';

type User = {
  ref: {
    id: string;
  },
  data: {
    stripe_custumer_id: string;
  }
}

export default async function subscribe (req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const session = await getSession({ req });

    const user = await fauna.query<User>(
      q.Get(
        q.Match(
          q.Index('user_by_email'),
          q.Casefold(session.user.email)
        )
      )
    );

    let custumerId = user.data.stripe_custumer_id;
    
    if(!custumerId) {
      const stripeCustomer = await stripe.customers.create({
        email: session.user.email,
      });

      await fauna.query(
        q.Update(
          q.Ref(q.Collection('users'), user.ref.id),
          {
            data: {
              stripe_custumer_id: stripeCustomer.id
            }
          }
        )
      );

      custumerId = stripeCustomer.id;
    }

    const stripeCheckoutSesssion = await stripe.checkout.sessions.create({
      customer: custumerId,
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      line_items: [{
        price: 'price_1KHGOPL0DV07srwHEDZe129s',
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: process.env.STRIPE_SUCCESS_URL,
      cancel_url: process.env.STRIPE_CANCEL_URL,
    });

    return res.status(200).json({ sessionId: stripeCheckoutSesssion.id });
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}