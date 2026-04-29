import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const PRECIOS: Record<string, { priceId: string, nombre: string }> = {
  pro_mensual:        { priceId: 'price_1TRPCY2eqOHhWfddQQpcErIP', nombre: 'NIDO Pro · Mensual' },
  pro_anual:          { priceId: 'price_1TRPDO2eqOHhWfddrV2wxJ52', nombre: 'NIDO Pro · Anual' },
  enterprise_mensual: { priceId: 'price_1TRPDm2eqOHhWfddmqJHZM1W', nombre: 'NIDO Enterprise · Mensual' },
  enterprise_anual:   { priceId: 'price_1TRPEC2eqOHhWfddbChA7mUp', nombre: 'NIDO Enterprise · Anual' },
}

export async function POST(req: NextRequest) {
  try {
    const { plan, anual, email } = await req.json()
    const key = plan + (anual ? '_anual' : '_mensual')
    const precio = PRECIOS[key]
    if (!precio) return NextResponse.json({ error: 'Plan no valido' }, { status: 400 })

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email || undefined,
      line_items: [{ price: precio.priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: 'https://www.nido-cr.com/dashboard?suscripcion=exitosa&plan=' + plan,
      cancel_url: 'https://www.nido-cr.com/precios',
      metadata: { plan, anual: anual ? 'true' : 'false' },
      subscription_data: {
        metadata: { plan, anual: anual ? 'true' : 'false' },
        trial_period_days: 7,
      },
      locale: 'es',
    })
    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Stripe error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
