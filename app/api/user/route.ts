import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/nextjs/server';
import { headers } from 'next/headers';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  // Verify the webhook signature
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(process.env.WEBHOOK_SECRET!);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    });
  }

  // Handle the webhook
  if ('email_addresses' in evt.data) {
    const { id, email_addresses } = evt.data;
    const email = email_addresses[0]?.email_address;

    // Check if user exists in Supabase
    const { data: existingUser, error: fetchError } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('user_id', id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching user:', fetchError);
      return NextResponse.json({ error: 'Error fetching user' }, { status: 500 });
    }

    if (!existingUser) {
      // User doesn't exist, create a new entry
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({ user_id: id, email: email });

      if (insertError) {
        console.error('Error creating user:', insertError);
        return NextResponse.json({ error: 'Error creating user' }, { status: 500 });
      }
    }

    return NextResponse.json({ message: 'User processed successfully' });
  } else {
    console.log('Received non-user event:', evt.type);
    return NextResponse.json({ message: 'Non-user event received' });
  }
}
