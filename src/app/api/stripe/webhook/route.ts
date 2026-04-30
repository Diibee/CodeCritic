import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) return NextResponse.json({ error: 'No signature' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  async function upsertSubscription(
    customerId: string,
    subscriptionId: string,
    status: string,
    periodEnd: number | null,
  ) {
    const { data: existing } = await supabaseAdmin
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_customer_id', customerId)
      .single()

    if (!existing) return

    await supabaseAdmin.from('subscriptions').update({
      stripe_subscription_id: subscriptionId,
      status,
      current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    }).eq('stripe_customer_id', customerId)
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.mode === 'subscription' && session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string) as unknown as Stripe.Subscription
        await upsertSubscription(
          session.customer as string,
          subscription.id,
          'active',
          (subscription as unknown as Record<string, number>)['current_period_end'] ?? null,
        )
      }
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const status = subscription.status === 'active' ? 'active' : subscription.status
      await upsertSubscription(
        subscription.customer as string,
        subscription.id,
        status,
        (subscription as unknown as Record<string, number>)['current_period_end'] ?? null,
      )
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      await upsertSubscription(
        subscription.customer as string,
        subscription.id,
        'canceled',
        null,
      )
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as unknown as Record<string, unknown>
      if (invoice['subscription']) {
        await supabaseAdmin.from('subscriptions').update({
          status: 'past_due',
          updated_at: new Date().toISOString(),
        }).eq('stripe_customer_id', invoice['customer'] as string)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
