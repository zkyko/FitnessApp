import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Image,
  Alert
} from 'react-native';
import { supabase } from '../services/supabaseClient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigation.replace('Dashboard');
      }
    };
    checkSession();
  }, []);

  const validateInputs = () => {
    if (!email || !password || (authMode === 'signup' && !fullName)) {
      Alert.alert('Error', 'Please fill in all fields');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Error', 'Please enter a valid email');
      return false;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleAuth = async () => {
    if (!validateInputs()) return;
    setLoading(true);
    try {
      console.log('Trying auth with:', email, password);
      if (authMode === 'login') {
        try {
          // Set a timeout for the request
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Login request timed out')), 15000)
          );
          
          const authPromise = supabase.auth.signInWithPassword({
            email: email.trim(),
            password
          });
          
          // Race the auth request against the timeout
          const { data, error } = await Promise.race([authPromise, timeoutPromise]);
          
          console.log('SignIn result:', data, 'Error:', error);
          if (error) throw error;
          navigation.replace('Dashboard');
        } catch (err) {
          if (err.message === 'Login request timed out') {
            Alert.alert('Error', 'Connection timed out. Please check your internet connection and try again.');
          } else {
            throw err;
          }
        }
      } else {
        try {
          // Set a timeout for the request
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Signup request timed out')), 15000)
          );
          
          const authPromise = supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
              data: {
                full_name: fullName.trim(),
                avatar_url: '',
                created_at: new Date().toISOString()
              }
            }
          });
          
          // Race the auth request against the timeout
          const { data, error } = await Promise.race([authPromise, timeoutPromise]);
          
          console.log('SignUp result:', data, 'Error:', error);
          if (error) throw error;
          
          // For demo purposes, automatically log in the user after signup
          Alert.alert(
            'Success',
            'Account created successfully!',
            [{ text: 'OK', onPress: () => navigation.replace('Dashboard') }]
          );
        } catch (err) {
          if (err.message === 'Signup request timed out') {
            Alert.alert('Error', 'Connection timed out. Please check your internet connection and try again.');
          } else {
            throw err;
          }
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) return Alert.alert('Error', 'Please enter your email first');
    if (!/\S+@\S+\.\S+/.test(email)) return Alert.alert('Error', 'Enter a valid email');

    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (error) throw error;
      Alert.alert('Success', 'Password reset email sent!');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <LinearGradient colors={['#4CAF50', '#2196F3']} style={styles.gradient}>
        <View style={styles.header}>
          <Image source={require('../assets/fitness-logo.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>
            {authMode === 'login' ? 'Welcome Back!' : 'Join FitJourney'}
          </Text>
          <Text style={styles.subtitle}>Your personal fitness companion</Text>
        </View>

        <View style={styles.formContainer}>
          {authMode === 'signup' && (
            <View style={styles.inputContainer}>
              <Icon name="account-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                placeholderTextColor="#999"
              />
            </View>
          )}

          <View style={styles.inputContainer}>
            <Icon name="email-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon name="lock-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { paddingRight: 40 }]}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              placeholderTextColor="#999"
            />
            <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
              <Icon name={showPassword ? 'eye-off' : 'eye'} size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {authMode === 'login' && (
            <TouchableOpacity onPress={handleForgotPassword}>
              <Text style={styles.forgotPassword}>Forgot Password?</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.authButton, loading && styles.authButtonDisabled]}
            onPress={handleAuth}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : (
              <Text style={styles.authButtonText}>
                {authMode === 'login' ? 'Login' : 'Sign Up'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.switchMode} onPress={() => {
            setAuthMode(authMode === 'login' ? 'signup' : 'login');
            setFullName('');
            setEmail('');
            setPassword('');
          }}>
            <Text style={styles.switchModeText}>
              {authMode === 'login'
                ? "Don't have an account? Sign Up"
                : 'Already have an account? Login'}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  header: { alignItems: 'center', paddingTop: 60 },
  logo: { width: 120, height: 120, marginBottom: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#fff', opacity: 0.9 },
  formContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 30,
    marginTop: 40,
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
    ...Platform.select({
      android: {
        elevation: 2,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
    }),
  },
  inputIcon: { padding: 10 },
  input: { flex: 1, padding: 12, fontSize: 16, color: '#333' },
  eyeIcon: { position: 'absolute', right: 10 },
  forgotPassword: {
    color: '#2196F3',
    textAlign: 'right',
    marginBottom: 20,
    fontSize: 14,
  },
  authButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    ...Platform.select({
      android: {
        elevation: 3,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
    }),
  },
  authButtonDisabled: { backgroundColor: '#a5d6a7' },
  authButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  switchMode: { alignItems: 'center' },
  switchModeText: { color: '#2196F3', fontSize: 16, fontWeight: '500' },
});
