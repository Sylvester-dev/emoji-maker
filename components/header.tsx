'use client';

import React from 'react';
import { UserButton } from "@clerk/nextjs";
import { useSupabaseUser } from "@/lib/useSupabaseUser";
import { Sparkles } from "lucide-react";

const Header: React.FC = () => {
  const { isSupabaseReady, user } = useSupabaseUser();

  if (!isSupabaseReady || !user) {
    return null;
  }

  return (
    <header className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-gray-800 dark:to-gray-900 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-purple-500" />
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">
              Apple Emoji Maker
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 px-3 py-1 rounded-full shadow-sm transition-all duration-300 hover:shadow-md">
              Hello, {user.firstName || user.username}!
            </span>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
              <UserButton 
                afterSignOutUrl="/" 
                appearance={{
                  elements: {
                    avatarBox: "h-10 w-10"
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;