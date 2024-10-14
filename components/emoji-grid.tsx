import React, { useEffect, useState } from 'react';
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Download } from "lucide-react";

interface Emoji {
  id: number;
  image_url: string;
  prompt: string;
  likes_count: number;
  creator_user_id: string;
  liked: boolean;
}

interface EmojiGridProps {
  emojis: Emoji[];
}

const EmojiGrid: React.FC<EmojiGridProps> = ({ emojis }) => {
  const [localEmojis, setLocalEmojis] = useState(emojis);

  useEffect(() => {
    setLocalEmojis(emojis);
  }, [emojis]);

  const handleLike = async (emojiId: number) => {
    try {
      const response = await fetch('/api/like-emoji', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emojiId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to toggle like');
      }

      const data = await response.json();
      console.log('Like response:', data);

      if (data.success) {
        setLocalEmojis(prevEmojis => prevEmojis.map(emoji => 
          emoji.id === emojiId ? { ...emoji, likes_count: data.likesCount, liked: data.liked } : emoji
        ));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleDownload = async (imageUrl: string, prompt: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `emoji_${prompt.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading emoji:', error);
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
      {localEmojis.map((emoji) => (
        <Card key={emoji.id} className="relative group overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
          <div className="aspect-square">
            <Image
              src={emoji.image_url}
              alt={emoji.prompt}
              layout="fill"
              objectFit="cover"
              className="rounded-t-xl"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
            <div className="flex items-center justify-between mb-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleLike(emoji.id)}
                className={`text-white transition-colors duration-200 ${emoji.liked ? 'text-red-500' : 'hover:text-red-500'}`}
              >
                <Heart className="h-6 w-6" fill={emoji.liked ? 'currentColor' : 'none'} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDownload(emoji.image_url, emoji.prompt)}
                className="text-white hover:text-blue-500 transition-colors duration-200"
              >
                <Download className="h-6 w-6" />
              </Button>
            </div>
            <p className="text-white text-sm font-medium truncate">{emoji.prompt}</p>
          </div>
          <div className="absolute top-2 right-2 bg-black/50 text-white text-xs font-bold px-2 py-1 rounded-full">
            {emoji.likes_count} {emoji.likes_count === 1 ? 'like' : 'likes'}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default EmojiGrid;