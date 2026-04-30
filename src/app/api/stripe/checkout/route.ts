import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  // Get or create Stripe customer
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  let customerId = sub?.stripe_customer_id

  if (!customerId) {
    const { data: { user: fullUser } } = await supabaseAdmin.auth.admin.getUserById(user.id)
    const customer = await stripe.customers.create({
      email: fullUser?.email,
      metadata: { supabase_user_id: user.id },
    })
    customerId = customer.id

    await supabaseAdmin.from('subscriptions').upsert({
      user_id: user.id,
      stripe_customer_id: customerId,
      status: 'free',
    }, { onConflict: 'user_id' })
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: process.env.STRIPE_PREMIUM_PRICE_ID!, quantity: 1 }],
    success_url: `${appUrl}/settings?upgraded=1`,
    cancel_url: `${appUrl}/pricing`,
    subscription_data: { metadata: { supabase_user_id: user.id } },
  })

  return NextResponse.json({ url: session.url })
}
