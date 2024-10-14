'use client';

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import EmojiGrid from "@/components/emoji-grid";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from '@supabase/supabase-js';
import { Sparkles } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Emoji {
  id: number;
  image_url: string;
  prompt: string;
  likes_count: number;
  creator_user_id: string;
  liked: boolean;
}

export default function Component() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [prompt, setPrompt] = useState("");
  const [emojis, setEmojis] = useState<Emoji[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isSignedIn) {
      fetchEmojis();
    }
  }, [isSignedIn]);

  const fetchEmojis = async () => {
    try {
      const { data: emojisData, error } = await supabase
        .from('emojis')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const { data: likedData, error: likedError } = await supabase
        .from('emoji_likes')
        .select('emoji_id')
        .eq('user_id', user?.id);

      if (likedError) throw likedError;

      const likedEmojiIds = new Set(likedData?.map(like => like.emoji_id) || []);

      const emojisWithLikedStatus = emojisData?.map(emoji => ({
        ...emoji,
        liked: likedEmojiIds.has(emoji.id)
      })) || [];

      setEmojis(emojisWithLikedStatus);
    } catch (error) {
      console.error('Error fetching emojis:', error);
      setError('Failed to fetch emojis');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-emoji', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (data.success) {
        await fetchEmojis();
        setPrompt('');
      } else {
        setError(data.error || 'Failed to generate emoji');
      }
    } catch (error) {
      setError('Error generating emoji');
      console.error('Error generating emoji:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 font-sans bg-gradient-to-br from-purple-100 to-pink-100 dark:from-gray-900 dark:to-gray-800">
      <main className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          <span role="img" aria-label="Emoji" className="text-5xl mr-2">🤩</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Emoji Maker
          </span>
        </h1>
        
        {isSignedIn ? (
          <>
            <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter a prompt to generate an emoji"
                  className="flex-grow text-lg"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
                >
                  {isLoading ? 'Generating...' : (
                    <>
                      Generate
                      <Sparkles className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
              {error && <p className="text-red-500 mt-2 text-center">{error}</p>}
            </div>

            {emojis.length > 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-semibold mb-4 text-center text-gray-800 dark:text-white">Apple style Emojis</h2>
                <EmojiGrid emojis={emojis} />
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-semibold mb-4 text-center text-gray-800 dark:text-white">Apple style Emojis</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {[...Array(8)].map((_, i) => (
                    <Skeleton key={i} className="h-40 w-full rounded-lg" />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg">
              Please sign in to generate and manage emojis.
            </p>
            <Button 
              onClick={() => window.location.href = '/sign-in'}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-2 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
            >
              Sign In
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}