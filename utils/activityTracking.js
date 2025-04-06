import { Platform, Alert } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import { supabase } from '../services/supabaseClient';

// Function to get step count from device sensors
export const getStepCount = async () => {
  try {
    // This is where we'd use a library like expo-sensors or react-native-health
    // For now, return simulated data
    return {
      steps: Math.floor(5000 + Math.random() * 7000),
      stepsGoal: 10000,
    };
  } catch (error) {
    console.error('Error getting step count:', error);
    return { steps: 0, stepsGoal: 10000 };
  }
};

// Function to get calories burned based on activity
export const getCaloriesBurned = async () => {
  try {
    // This would typically come from a fitness API or health kit
    const baseCalories = 250;
    const variation = Math.floor(Math.random() * 200);
    return {
      calories: baseCalories + variation,
      caloriesGoal: 500,
    };
  } catch (error) {
    console.error('Error getting calories burned:', error);
    return { calories: 0, caloriesGoal: 500 };
  }
};

// Function to get active minutes
export const getActiveMinutes = async () => {
  try {
    // This would come from device motion/activity recognition
    return {
      activeMins: Math.floor(20 + Math.random() * 60),
      activeMinsGoal: 60,
    };
  } catch (error) {
    console.error('Error getting active minutes:', error);
    return { activeMins: 0, activeMinsGoal: 60 };
  }
};

// Function to get water intake from user logs
export const getWaterIntake = async (userEmail) => {
  try {
    // In real app, this would query from a database
    const { data, error } = await supabase
      .from('water_logs')
      .select('*')
      .eq('user_email', userEmail)
      .gte('created_at', new Date().toISOString().split('T')[0])
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    // Sum up water intake from logs or return default
    const waterIntake = data?.reduce((total, log) => total + (log.cups || 0), 0) || 0;
    return {
      waterIntake,
      waterIntakeGoal: 8,
    };
  } catch (error) {
    console.error('Error getting water intake:', error);
    return { waterIntake: 0, waterIntakeGoal: 8 };
  }
};

// Function to upload image and get food analysis (simulated for now)
export const analyzeFood = async (imageUri) => {
  try {
    // Resize image to lower size for faster upload
    const manipResult = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 800 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );
    
    // In a real app, we would upload to a food recognition API like DeepSeek
    // For demo, simulate an API response
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
    
    // Simulated analysis results
    const foodItems = [
      { name: 'Grilled Chicken', calories: 250, protein: 30, carbs: 0, fat: 10 },
      { name: 'Brown Rice', calories: 180, protein: 4, carbs: 35, fat: 2 },
      { name: 'Broccoli', calories: 55, protein: 3, carbs: 10, fat: 0 },
    ];
    
    const totalNutrition = foodItems.reduce((total, item) => ({
      calories: total.calories + item.calories,
      protein: total.protein + item.protein, 
      carbs: total.carbs + item.carbs,
      fat: total.fat + item.fat
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
    
    return {
      success: true,
      foodItems,
      totalNutrition,
    };
  } catch (error) {
    console.error('Error analyzing food:', error);
    return {
      success: false,
      error: error.message || 'Failed to analyze food image',
    };
  }
};

// Function to log activity with photo evidence
export const logActivity = async (activityData) => {
  try {
    const { userEmail, activityType, note, photoUri } = activityData;
    
    if (!userEmail || !activityType || !photoUri) {
      throw new Error('Missing required data for activity log');
    }
    
    // 1. Upload photo to storage
    const photoResult = await uploadActivityPhoto(userEmail, activityType, photoUri);
    if (!photoResult.success) throw new Error(photoResult.error);
    
    // 2. Save activity log to database
    const { error } = await supabase.from('habit_logs').insert({
      user_email: userEmail,
      habit_type: activityType,
      photo_url: photoResult.photoUrl,
      note: note || '',
      verified: false,
      verified_by: null,
      created_at: new Date().toISOString(),
    });
    
    if (error) throw error;
    
    return {
      success: true,
      message: 'Activity logged successfully!',
    };
  } catch (error) {
    console.error('Error logging activity:', error);
    return {
      success: false,
      error: error.message || 'Failed to log activity',
    };
  }
};

// Helper function to upload activity photo to storage
async function uploadActivityPhoto(userEmail, activityType, photoUri) {
  try {
    // Resize image to lower size for faster upload
    const manipResult = await ImageManipulator.manipulateAsync(
      photoUri,
      [{ resize: { width: 1200 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );
    
    const filename = `${userEmail.split('@')[0]}_${activityType}_${Date.now()}.jpg`;
    const photoUriForUpload = manipResult.uri;
    
    // Get the binary data from the image
    const response = await fetch(photoUriForUpload);
    const blob = await response.blob();
    
    // Check if bucket exists or create it
    const { data: buckets } = await supabase.storage.listBuckets();
    const habitBucketExists = buckets?.some(bucket => bucket.name === 'habit_photos');
    
    if (!habitBucketExists) {
      const { error: createBucketError } = await supabase.storage.createBucket('habit_photos', {
        public: true,
        fileSizeLimit: 5242880 // 5MB
      });
      
      if (createBucketError) {
        return {
          success: false,
          error: 'Failed to create storage bucket: ' + createBucketError.message
        };
      }
    }
    
    // Upload the file
    const { error: uploadError } = await supabase.storage
      .from('habit_photos')
      .upload(filename, blob, { 
        cacheControl: '3600',
        upsert: true, 
        contentType: 'image/jpeg'
      });
    
    if (uploadError) {
      return {
        success: false,
        error: 'Failed to upload image: ' + uploadError.message
      };
    }
    
    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('habit_photos')
      .getPublicUrl(filename);
    
    if (!publicUrl) {
      return {
        success: false,
        error: 'Failed to get public URL for image'
      };
    }
    
    return {
      success: true,
      photoUrl: publicUrl
    };
  } catch (error) {
    console.error('Error uploading photo:', error);
    return {
      success: false,
      error: error.message || 'Failed to upload photo'
    };
  }
}