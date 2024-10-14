import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ToggleLikeResponse {
  new_likes_count: number;
  liked: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request) || {};
    if (!userId) {
      console.error('Unauthorized: No user ID found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json();
    console.log('Received request body:', body);

    const { emojiId } = body;

    if (!emojiId) {
      console.error('Missing emojiId in request body');
      return NextResponse.json({ error: 'Missing emojiId' }, { status: 400 })
    }

    console.log(`Attempting to toggle like for emoji ID: ${emojiId}`);

    // Call the custom function to toggle like
    const { data, error } = await supabase
      .rpc('toggle_emoji_like', { p_user_id: userId, p_emoji_id: emojiId })
      .single();

    if (error) {
      console.error('Error toggling like:', error);
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const typedData = data as ToggleLikeResponse;

    if (!typedData || typeof typedData.new_likes_count !== 'number' || typeof typedData.liked !== 'boolean') {
      console.error('Unexpected response from toggle_emoji_like:', typedData);
      return NextResponse.json({ error: 'Unexpected response from server' }, { status: 500 })
    }

    console.log('Successfully toggled like. New count:', typedData.new_likes_count, 'Liked:', typedData.liked);

    return NextResponse.json({ success: true, likesCount: typedData.new_likes_count, liked: typedData.liked })
  } catch (error) {
    console.error('Unexpected error in like-emoji API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
