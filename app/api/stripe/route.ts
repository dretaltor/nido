import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const { plan } = await req.json()
  const precios = {
    basico: { amount: 4900, name: 'NIDO Pro Basico' },
    pro: { amount: 9900, name: 'NIDO Pro' },
    agencia: { amount: 29900, name: 'NIDO Agencia' }
  }
  const precio = precios[plan as keyof typeof precios]
  if (!precio) return NextResponse.json({ error: 'Plan no valido' }, { status: 400 })
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{ price_data: { currency: 'usd', product_data: { name: precio.name }, unit_amount: precio.amount, recurring: { interval: 'month' } }, quantity: 1 }],
    mode: 'subscription',
    success_url: 'https://www.nido-cr.com/dashboard',
    cancel_url: 'https://www.nido-cr.com/precios',
  })
  return NextResponse.json({ url: session.url })
}