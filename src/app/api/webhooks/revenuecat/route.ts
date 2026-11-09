import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/server/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // RevenueCat nests the actual webhook data inside an "event" object
    const event = body.event;

    if (!event) {
      return NextResponse.json({ error: 'Invalid payload structure' }, { status: 400 });
    }

    const { type, app_user_id } = event;

    // Process only initial purchases and renewals
    if (type === 'INITIAL_PURCHASE' || type === 'RENEWAL') {
      if (!app_user_id) {
        return NextResponse.json({ error: 'Missing app_user_id in event' }, { status: 400 });
      }

      // Atomically increment the user's tokens and activate their subscription
      await db.user.update({
        where: {
          id: app_user_id,
        },
        data: {
          subscriptionStatus: 'active',
          tokensRemaining: {
            increment: 500, // Adjust this amount based on your tier limits
          },
        },
      });

      console.log(`[RevenueCat] Processed ${type} for user: ${app_user_id}`);
    }

    // Always return a 200 OK as quickly as possible to prevent RevenueCat from retrying
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('[RevenueCat Webhook Error]:', error);
    
    // Returning a 500 tells RevenueCat to retry the webhook delivery later
    return NextResponse.json(
      { error: 'Internal server error processing webhook' },
      { status: 500 }
    );
  }
}