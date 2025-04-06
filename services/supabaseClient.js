import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Polyfill: make AsyncStorage available globally
if (!global.AsyncStorage) {
  global.AsyncStorage = AsyncStorage;
}

// Use a public Supabase project for demo purposes only, not for production
const supabaseUrl = 'https://xyzcompany.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtdnBmanVjeWR1Ym95amt3aHRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Nzk5NjYzNDcsImV4cCI6MTk5NTU0MjM0N30.x-tRVGAwd5oYXkv-Fv2DHvEwbwQQx9XnKfwY-qwQ-5Y';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Not needed for React Native
    storageKey: 'supabase.auth.token',
    storage: {
      getItem: async (key) => {
        const value = await AsyncStorage.getItem(key);
        return value ? JSON.parse(value) : null;
      },
      setItem: async (key, value) => {
        await AsyncStorage.setItem(key, JSON.stringify(value));
      },
      removeItem: async (key) => {
        await AsyncStorage.removeItem(key);
      },
    },
  },
});

console.log('Supabase client initialized successfully');
