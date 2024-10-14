import { NextResponse } from 'next/server';
import Replicate from "replicate";
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ success: false, error: 'Prompt is required' }, { status: 400 });
    }

    console.log('Generating emoji with prompt:', prompt);

    const output = await replicate.run(
      "fofr/sdxl-emoji:dee76b5afde21b0f01ed7925f0665b7e879c50ee718c5f78a9d38e04d523cc5e",
      {
        input: {
          width: 1024,
          height: 1024,
          prompt: "A TOK emoji of a " + prompt,
          refine: "no_refiner",
          scheduler: "K_EULER",
          lora_scale: 0.6,
          num_outputs: 1,
          guidance_scale: 7.5,
          apply_watermark: false,
          high_noise_frac: 0.8,
          negative_prompt: "",
          prompt_strength: 0.8,
          num_inference_steps: 50
        }
      }
    );

    console.log('Replicate output:', output);

    if (Array.isArray(output) && output.length > 0 && output[0] instanceof ReadableStream) {
      const reader = output[0].getReader();
      const chunks = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
      const imageBuffer = Buffer.concat(chunks);
      const base64Image = imageBuffer.toString('base64');

      // Upload to Supabase Storage
      const fileName = `emoji_${Date.now()}.png`;
      const { error: uploadError } = await supabase.storage
        .from('emojis')
        .upload(fileName, imageBuffer, {
          contentType: 'image/png'
        });

      if (uploadError) {
        console.error('Error uploading to Supabase:', uploadError);
        return NextResponse.json({ success: false, error: 'Failed to upload emoji' }, { status: 500 });
      }

      // Get the public URL of the uploaded image
      const { data: { publicUrl } } = supabase.storage
        .from('emojis')
        .getPublicUrl(fileName);

      // Insert record into emojis table
      const { error: insertError } = await supabase
        .from('emojis')
        .insert({
          image_url: publicUrl,
          prompt: prompt,
          creator_user_id: userId
        });

      if (insertError) {
        console.error('Error inserting into emojis table:', insertError);
        return NextResponse.json({ success: false, error: 'Failed to save emoji data' }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true, 
        emoji: publicUrl,
        base64Image: `data:image/png;base64,${base64Image}`
      });
    } else {
      console.error('Unexpected output format:', output);
      return NextResponse.json({ success: false, error: 'Unexpected output format' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error generating emoji:', error);
    if (error instanceof Response) {
      const text = await error.text();
      console.error('Error response text:', text);
      return NextResponse.json({ success: false, error: 'Failed to generate emoji', details: text }, { status: error.status });
    }
    return NextResponse.json({ success: false, error: 'Failed to generate emoji', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
