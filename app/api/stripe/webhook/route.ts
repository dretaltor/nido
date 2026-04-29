import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const plan = session.metadata?.plan || 'pro'
    const anual = session.metadata?.anual === 'true'
    const email = session.customer_email || ''

    // Guardar suscripcion en Supabase
    await supabase.from('suscripciones').upsert({
      correo: email,
      plan,
      periodo: anual ? 'anual' : 'mensual',
      stripe_session_id: session.id,
      stripe_subscription_id: session.subscription as string,
      activo: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'correo' })

    // Enviar email de confirmacion
    await fetch(process.env.NEXT_PUBLIC_SITE_URL + '/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: email,
        tipo: 'suscripcion_exitosa',
        data: { plan, anual }
      })
    })

    console.log('Suscripcion guardada y email enviado:', email, plan)
  }

  if (event.type === 'customer.subscription.updated') {
    const sub = event.data.object as Stripe.Subscription
    await supabase.from('suscripciones').update({
      activo: sub.status === 'active',
      updated_at: new Date().toISOString(),
    }).eq('stripe_subscription_id', sub.id)
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription
    await supabase.from('suscripciones').update({
      activo: false,
      updated_at: new Date().toISOString(),
    }).eq('stripe_subscription_id', sub.id)
  }

  return NextResponse.json({ received: true })
}
