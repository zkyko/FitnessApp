import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import StackNavigator from './navigation/StackNavigator';
import { supabase } from './services/supabaseClient';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check Supabase initialization or perform any app-wide setup
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          throw error;
        }
        
        setSession(data.session);
        console.log('App initialized, session:', !!data.session);
        
        // Setup auth listener for session changes
        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (_event, newSession) => {
            console.log('Auth state changed:', _event, !!newSession);
            setSession(newSession);
          }
        );
        
        return () => {
          if (authListener && authListener.subscription) {
            authListener.subscription.unsubscribe();
          }
        };
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setIsReady(true);
      }
    };

    initializeApp();
  }, []);

  // Use accessibilityState instead of pointerEvents for better accessibility
  if (!isReady) {
    return (
      <View 
        style={styles.loadingContainer}
        accessibilityState={{ busy: true }}
      >
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return <StackNavigator initialSession={session} />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
  },
});