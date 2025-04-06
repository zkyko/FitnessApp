import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { supabase } from '../services/supabaseClient';
import { logActivity } from '../utils/activityTracking';

const HABITS = [
  { id: 'sleep', label: 'Sleep', icon: 'sleep' },
  { id: 'breakfast', label: 'Breakfast', icon: 'food' },
  { id: 'lunch', label: 'Lunch', icon: 'food-variant' },
  { id: 'exercise', label: 'Exercise', icon: 'dumbbell' },
  { id: 'no_smoking', label: 'No Smoking', icon: 'smoking-off' },
  { id: 'no_drinking', label: 'No Drinking', icon: 'glass-wine' },
];

export default function LogHabitScreen({ navigation }) {
  const [habitType, setHabitType] = useState('');
  const [note, setNote] = useState('');
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Get current user's email from Supabase session
  const getUserEmail = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // DEVELOPMENT MODE: Use a fake email for development when no session exists
      if (!session?.user) {
        console.log('DEV MODE: Using development test account in LogHabitScreen');
        return 'dev@example.com';
        
        // Uncomment for production:
        // Alert.alert('Error', 'User not authenticated. Please log in.');
        // navigation.replace('Login');
        // return null;
      }
      
      return session.user.email;
    } catch (error) {
      console.log('Error getting user email, using dev account', error);
      return 'dev@example.com';
    }
  };

  // Pick image with permissions handling
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need permission to access your photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  // Upload habit log with professional error handling
  const uploadHabitLog = async () => {
    if (!habitType) {
      Alert.alert('Error', 'Please select a habit to log.');
      return;
    }
    if (!image) {
      Alert.alert('Error', 'Please upload a photo to verify your habit.');
      return;
    }

    setUploading(true);
    try {
      const userEmail = await getUserEmail();
      if (!userEmail) return;

      // Use the centralized activity logging function
      const result = await logActivity({
        userEmail,
        activityType: habitType,
        note: note.trim(),
        photoUri: image
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to log activity');
      }

      Alert.alert('Success', 'Activity logged successfully!', [
        { text: 'OK', onPress: () => navigation.navigate('Dashboard') },
      ]);
      
      // Reset form
      setImage(null);
      setNote('');
      setHabitType('');
    } catch (error) {
      console.error('Upload Error:', error);
      Alert.alert('Error', error.message || 'Failed to log habit. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <LinearGradient colors={['#4CAF50', '#2196F3']} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Log Your Habit</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Select a Habit</Text>
          <View style={styles.habitPicker}>
            {HABITS.map((habit) => (
              <TouchableOpacity
                key={habit.id}
                style={[
                  styles.habitButton,
                  habitType === habit.id && styles.habitButtonSelected,
                ]}
                onPress={() => setHabitType(habit.id)}
                disabled={uploading}
              >
                <Icon
                  name={habit.icon}
                  size={24}
                  color={habitType === habit.id ? '#fff' : '#666'}
                />
                <Text
                  style={[
                    styles.habitText,
                    habitType === habit.id && styles.habitTextSelected,
                  ]}
                >
                  {habit.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.imagePickerButton}
            onPress={pickImage}
            disabled={uploading}
          >
            <Icon name="camera" size={20} color="#fff" />
            <Text style={styles.imagePickerText}>
              {image ? 'Change Photo' : 'Add a Photo'}
            </Text>
          </TouchableOpacity>
          {image && (
            <Image source={{ uri: image }} style={styles.preview} resizeMode="cover" />
          )}

          <View style={styles.inputContainer}>
            <Icon name="note-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              placeholder="Add a note (optional)"
              value={note}
              onChangeText={setNote}
              style={styles.input}
              multiline
              maxLength={200}
              placeholderTextColor="#999"
              editable={!uploading}
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, uploading && styles.submitButtonDisabled]}
            onPress={uploadHabitLog}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>Submit Habit Log</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    ...Platform.select({
      android: {
        elevation: 5,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
      },
    }),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  habitPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  habitButton: {
    width: '30%',
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  habitButtonSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  habitText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  habitTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  imagePickerButton: {
    flexDirection: 'row',
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  imagePickerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
    marginBottom: 20,
    minHeight: 60,
  },
  inputIcon: {
    padding: 10,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
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
  submitButtonDisabled: {
    backgroundColor: '#a5d6a7',
  },
  submitText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});