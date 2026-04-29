import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error('Webhook error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  console.log('Stripe event:', event.type)

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    console.log('Pago completado:', session.customer_email, session.metadata?.plan)
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription
    console.log('Suscripcion cancelada:', sub.id)
  }

  return NextResponse.json({ received: true })
}
