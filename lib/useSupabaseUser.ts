import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function useSupabaseUser() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [isSupabaseReady, setIsSupabaseReady] = useState(false);

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      const checkAndCreateUser = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking user:', error);
          return;
        }

        if (!data) {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({ user_id: user.id, email: user.primaryEmailAddress?.emailAddress });

          if (insertError) {
            console.error('Error creating user:', insertError);
            return;
          }
        }

        setIsSupabaseReady(true);
      };

      checkAndCreateUser();
    }
  }, [isLoaded, isSignedIn, user]);

  return { isSupabaseReady, user };
}
