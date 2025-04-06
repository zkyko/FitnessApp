import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../services/supabaseClient';
// Define colors locally to avoid circular dependency
const COLORS = {
  primary: '#4361EE',
  secondary: '#3A0CA3',
  accent: '#F72585',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  background: '#F8F9FA',
  card: '#FFFFFF',
  text: '#212529',
  border: '#E9ECEF',
  notification: '#F72585',
  lightGray: '#CED4DA',
  darkGray: '#6C757D',
};

import { 
  getStepCount, 
  getCaloriesBurned, 
  getActiveMinutes, 
  getWaterIntake 
} from '../utils/activityTracking';

// Mock data for upcoming workouts
const UPCOMING_WORKOUTS = [
  {
    id: '1',
    title: 'HIIT Cardio',
    time: 'Today, 6:00 PM',
    duration: '30 min',
    difficulty: 'Medium',
    completed: false,
  },
  {
    id: '2',
    title: 'Yoga & Stretching',
    time: 'Tomorrow, 7:30 AM',
    duration: '45 min',
    difficulty: 'Easy',
    completed: false,
  },
];

// Mock data for recent achievements
const RECENT_ACHIEVEMENTS = [
  {
    id: '1',
    title: 'Early Bird',
    description: 'Completed a workout before 8 AM',
    icon: 'sunny-outline',
    date: '2 days ago',
    xp: 50,
  },
  {
    id: '2',
    title: '3-Day Streak',
    description: 'Logged workouts for 3 days in a row',
    icon: 'flame-outline',
    date: 'Yesterday',
    xp: 75,
  },
];

export default function Dashboard({ navigation }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Fitness Enthusiast');
  
  // Activity tracking data
  const [activityData, setActivityData] = useState({
    steps: 0,
    stepsGoal: 10000,
    calories: 0,
    caloriesGoal: 500,
    activeMins: 0,
    activeMinsGoal: 60,
    waterIntake: 0,
    waterIntakeGoal: 8,
    dailyGoal: 0 // Percentage of goals achieved
  });

  // Fetch the current user's email
  const getUserEmail = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // DEVELOPMENT MODE: Use a fake email for development when no session exists
      if (!session?.user) {
        console.log('DEV MODE: Using development test account');
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

  // Fetch logs for the current user
  const fetchLogs = async () => {
    try {
      setLoading(true);
      const userEmail = await getUserEmail();
      if (!userEmail) return; // Stop if user is not authenticated

      const { data, error } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('user_email', userEmail) // Filter by the current user's email
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching logs:', error);
        Alert.alert('Error', 'Failed to fetch habit logs. Please try again.');
        return;
      }

      setLogs(data || []);
    } catch (error) {
      console.error('Unexpected error fetching logs:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Verify a habit log
  const handleVerify = async (id) => {
    try {
      const userEmail = await getUserEmail();
      if (!userEmail) return;

      const { error } = await supabase
        .from('habit_logs')
        .update({ verified: true, verified_by: userEmail })
        .eq('id', id);

      if (error) {
        console.error('Verification error:', error);
        Alert.alert('Error', 'Failed to verify habit log. Please try again.');
        return;
      }

      await fetchLogs(); // Refresh the logs after verification
    } catch (error) {
      console.error('Unexpected error during verification:', error);
      Alert.alert('Error', 'An unexpected error occurred during verification.');
    }
  };

  // Function to calculate overall daily goal percentage
  const calculateDailyGoalPercentage = (data) => {
    const { steps, stepsGoal, calories, caloriesGoal, activeMins, activeMinsGoal, waterIntake, waterIntakeGoal } = data;
    
    // Calculate percentage for each goal
    const stepPercentage = Math.min(100, (steps / stepsGoal) * 100);
    const caloriePercentage = Math.min(100, (calories / caloriesGoal) * 100);
    const activeMinPercentage = Math.min(100, (activeMins / activeMinsGoal) * 100);
    const waterPercentage = Math.min(100, (waterIntake / waterIntakeGoal) * 100);
    
    // Average of all percentages
    const overallPercentage = Math.round((stepPercentage + caloriePercentage + activeMinPercentage + waterPercentage) / 4);
    
    return overallPercentage;
  };
  
  // Function to fetch all activity data
  const fetchActivityData = async () => {
    try {
      const userEmail = await getUserEmail();
      
      // Fetch step count
      const stepData = await getStepCount();
      
      // Fetch calories burned
      const calorieData = await getCaloriesBurned();
      
      // Fetch active minutes
      const activeData = await getActiveMinutes();
      
      // Fetch water intake
      const waterData = await getWaterIntake(userEmail);
      
      // Combine all data
      const newActivityData = {
        ...stepData,
        ...calorieData,
        ...activeData,
        ...waterData,
      };
      
      // Calculate overall daily goal percentage
      const dailyGoal = calculateDailyGoalPercentage(newActivityData);
      
      // Update state with all data
      setActivityData({
        ...newActivityData,
        dailyGoal,
      });
      
    } catch (error) {
      console.error('Error fetching activity data:', error);
      Alert.alert('Error', 'Failed to fetch activity data. Please try again.');
    }
  };
  
  // Fetch logs and activity data on component mount
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchLogs(),
          fetchActivityData()
        ]);
        
        // Simulate fetching user profile
        setTimeout(() => {
          setUserName('Alex Johnson');
        }, 500);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
    
    // Set up a refresh interval for activity data (every 2 minutes)
    const refreshInterval = setInterval(() => {
      fetchActivityData();
    }, 120000);
    
    // Clean up the interval on component unmount
    return () => clearInterval(refreshInterval);
  }, []);

  // Progress ring component
  const ProgressRing = ({ progress, size = 70, strokeWidth = 8, color = COLORS.primary }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <View style={{ width: size, height: size, position: 'relative' }}>
        {/* Background circle */}
        <View 
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: COLORS.border,
            position: 'absolute',
          }}
        />
        
        {/* Progress circle */}
        <View 
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: color,
            borderTopColor: 'transparent',
            borderRightColor: progress > 25 ? color : 'transparent',
            borderBottomColor: progress > 50 ? color : 'transparent',
            borderLeftColor: progress > 75 ? color : 'transparent',
            transform: [{ rotate: `${progress * 3.6}deg` }],
            position: 'absolute',
          }}
        />
        
        {/* Center text */}
        <View style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: COLORS.text }}>
            {progress}%
          </Text>
        </View>
      </View>
    );
  };

  // Progress bar component
  const ProgressBar = ({ progress, label, value, goal, icon, color = COLORS.primary }) => {
    return (
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarHeader}>
          <View style={styles.progressBarLeft}>
            <View style={[styles.progressBarIcon, { backgroundColor: `${color}20` }]}>
              <Ionicons name={icon} size={16} color={color} />
            </View>
            <Text style={styles.progressBarLabel}>{label}</Text>
          </View>
          <Text style={styles.progressBarValue}>
            {value}<Text style={styles.progressBarGoal}>/{goal}</Text>
          </Text>
        </View>
        <View style={styles.progressBarTrack}>
          <View 
            style={[
              styles.progressBarFill, 
              { width: `${progress}%`, backgroundColor: color }
            ]} 
          />
        </View>
      </View>
    );
  };

  // Workout card component
  const WorkoutCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.workoutCard}
      onPress={() => navigation.navigate('WorkoutTab')}
    >
      <View style={styles.workoutCardLeft}>
        <View style={styles.workoutIconContainer}>
          <Ionicons name="barbell-outline" size={20} color={COLORS.primary} />
        </View>
        <View>
          <Text style={styles.workoutTitle}>{item.title}</Text>
          <Text style={styles.workoutTime}>{item.time}</Text>
        </View>
      </View>
      <View style={styles.workoutCardRight}>
        <Text style={styles.workoutDuration}>{item.duration}</Text>
        <View style={styles.workoutDifficulty}>
          <Text style={styles.workoutDifficultyText}>{item.difficulty}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Achievement card component
  const AchievementCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.achievementCard}
      onPress={() => navigation.navigate('GoalsTab')}
    >
      <View style={styles.achievementIconContainer}>
        <Ionicons name={item.icon} size={24} color="#fff" />
      </View>
      <View style={styles.achievementContent}>
        <Text style={styles.achievementTitle}>{item.title}</Text>
        <Text style={styles.achievementDesc}>{item.description}</Text>
        <View style={styles.achievementFooter}>
          <Text style={styles.achievementDate}>{item.date}</Text>
          <View style={styles.achievementXp}>
            <Ionicons name="flash" size={12} color={COLORS.warning} />
            <Text style={styles.achievementXpText}>{item.xp} XP</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Log card component
  const LogCard = ({ item }) => (
    <View style={styles.logCard}>
      <View style={styles.logCardHeader}>
        <Text style={styles.logType}>
          {item.habit_type?.toUpperCase() || 'ACTIVITY'}
        </Text>
        <Text style={styles.logDate}>
          {new Date(item.created_at).toLocaleString()}
        </Text>
      </View>
      
      {item.photo_url ? (
        <Image source={{ uri: item.photo_url }} style={styles.logImage} resizeMode="cover" />
      ) : (
        <View style={styles.noImageContainer}>
          <Ionicons name="image-outline" size={30} color={COLORS.lightGray} />
          <Text style={styles.noImageText}>No Image Available</Text>
        </View>
      )}
      
      {item.note ? (
        <View style={styles.noteContainer}>
          <Ionicons name="chatbubble-outline" size={16} color={COLORS.darkGray} style={styles.noteIcon} />
          <Text style={styles.noteText}>{item.note}</Text>
        </View>
      ) : null}
      
      <View style={styles.logCardFooter}>
        <View style={[
          styles.verificationBadge,
          item.verified ? styles.verifiedBadge : styles.unverifiedBadge
        ]}>
          <Ionicons 
            name={item.verified ? "checkmark-circle" : "timer-outline"} 
            size={16} 
            color={item.verified ? COLORS.success : COLORS.warning} 
          />
          <Text style={[
            styles.verificationText,
            item.verified ? styles.verifiedText : styles.unverifiedText
          ]}>
            {item.verified ? 'Verified' : 'Pending Verification'}
          </Text>
        </View>
        
        {!item.verified && (
          <TouchableOpacity
            style={styles.verifyButton}
            onPress={() => handleVerify(item.id)}
          >
            <Text style={styles.verifyText}>Verify</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Welcome header */}
        <View style={styles.welcomeSection}>
          <View>
            <Text style={styles.welcomeTitle}>
              Welcome back,
            </Text>
            <Text style={styles.welcomeName}>{userName}</Text>
          </View>
          <TouchableOpacity 
            style={styles.todayButton}
            onPress={() => navigation.navigate('LogHabit')}
          >
            <Ionicons name="add-circle" size={20} color={COLORS.primary} />
            <Text style={styles.todayButtonText}>Log Activity</Text>
          </TouchableOpacity>
        </View>

        {/* Today's progress */}
        <View style={styles.todayProgressCard}>
          <View style={styles.todayProgressHeader}>
            <Text style={styles.sectionTitle}>Today's Progress</Text>
            <Text style={styles.todayDate}>
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })}
            </Text>
          </View>
          
          <View style={styles.dailyProgressContainer}>
            <ProgressRing progress={activityData.dailyGoal} />
            <View style={styles.dailyGoalText}>
              <Text style={styles.dailyGoalTitle}>Daily Goal</Text>
              <Text style={styles.dailyGoalDesc}>
                {activityData.dailyGoal < 50 
                  ? "You're making progress! Keep going to reach your daily goals."
                  : activityData.dailyGoal < 80
                    ? "You're doing well! More than halfway to your daily goals."
                    : "You're crushing it! Almost there with your daily goals."}
              </Text>
            </View>
          </View>
          
          <View style={styles.metricsContainer}>
            <ProgressBar 
              progress={(activityData.steps / activityData.stepsGoal) * 100}
              label="Steps"
              value={activityData.steps}
              goal={activityData.stepsGoal}
              icon="footsteps-outline"
              color={COLORS.primary}
            />
            <ProgressBar 
              progress={(activityData.calories / activityData.caloriesGoal) * 100}
              label="Calories"
              value={activityData.calories}
              goal={activityData.caloriesGoal}
              icon="flame-outline"
              color="#FF9800"
            />
            <ProgressBar 
              progress={(activityData.activeMins / activityData.activeMinsGoal) * 100}
              label="Active Minutes"
              value={activityData.activeMins}
              goal={activityData.activeMinsGoal}
              icon="timer-outline"
              color="#F72585"
            />
            <ProgressBar 
              progress={(activityData.waterIntake / activityData.waterIntakeGoal) * 100}
              label="Water (cups)"
              value={activityData.waterIntake}
              goal={activityData.waterIntakeGoal}
              icon="water-outline"
              color="#2196F3"
            />
          </View>
        </View>

        {/* Upcoming workouts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Workouts</Text>
            <TouchableOpacity onPress={() => navigation.navigate('WorkoutTab')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {UPCOMING_WORKOUTS.map(workout => (
            <WorkoutCard key={workout.id} item={workout} />
          ))}
        </View>

        {/* Recent achievements */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Achievements</Text>
            <TouchableOpacity onPress={() => navigation.navigate('GoalsTab')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {RECENT_ACHIEVEMENTS.map(achievement => (
            <AchievementCard key={achievement.id} item={achievement} />
          ))}
        </View>

        {/* Activity logs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity Logs</Text>
            <TouchableOpacity onPress={() => navigation.navigate('LogHabit')}>
              <Text style={styles.seeAllText}>Add New</Text>
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={styles.logsLoader} />
          ) : logs.length === 0 ? (
            <View style={styles.emptyLogsContainer}>
              <Ionicons name="document-text-outline" size={48} color={COLORS.lightGray} />
              <Text style={styles.emptyLogsText}>No activity logs yet</Text>
              <TouchableOpacity 
                style={styles.logNewButton}
                onPress={() => navigation.navigate('LogHabit')}
              >
                <Text style={styles.logNewButtonText}>Log New Activity</Text>
              </TouchableOpacity>
            </View>
          ) : (
            logs.slice(0, 2).map(log => (
              <LogCard key={log.id} item={log} />
            ))
          )}
          
          {logs.length > 0 && (
            <TouchableOpacity 
              style={styles.viewMoreButton}
              onPress={() => {
                // Navigate to a full list of logs
                console.log('View more logs');
              }}
            >
              <Text style={styles.viewMoreText}>View All Activity Logs</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  welcomeTitle: {
    fontSize: 16,
    color: COLORS.darkGray,
  },
  welcomeName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  todayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.primary}15`,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  todayButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary,
  },
  todayProgressCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    margin: 16,
    marginTop: 8,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  todayProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  todayDate: {
    color: COLORS.darkGray,
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  dailyProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  dailyGoalText: {
    flex: 1,
    marginLeft: 16,
  },
  dailyGoalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  dailyGoalDesc: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 20,
  },
  metricsContainer: {
    marginTop: 8,
  },
  progressBarContainer: {
    marginBottom: 12,
  },
  progressBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  progressBarLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  progressBarValue: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  progressBarGoal: {
    color: COLORS.darkGray,
    fontWeight: 'normal',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  workoutCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  workoutCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workoutIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  workoutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  workoutTime: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  workoutCardRight: {
    alignItems: 'flex-end',
  },
  workoutDuration: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 4,
  },
  workoutDifficulty: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: COLORS.background,
    borderRadius: 12,
  },
  workoutDifficultyText: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  achievementIconContainer: {
    width: 70,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementContent: {
    flex: 1,
    padding: 16,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  achievementDesc: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  achievementFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  achievementDate: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  achievementXp: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.warning}15`,
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  achievementXpText: {
    fontSize: 12,
    color: COLORS.warning,
    fontWeight: '600',
    marginLeft: 4,
  },
  logCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  logCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  logType: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  logDate: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  logImage: {
    width: '100%',
    height: 180,
  },
  noImageContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  noImageText: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.darkGray,
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  noteIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  logCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  verifiedBadge: {
    backgroundColor: `${COLORS.success}15`,
  },
  unverifiedBadge: {
    backgroundColor: `${COLORS.warning}15`,
  },
  verificationText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  verifiedText: {
    color: COLORS.success,
  },
  unverifiedText: {
    color: COLORS.warning,
  },
  verifyButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  verifyText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  logsLoader: {
    marginVertical: 20,
  },
  emptyLogsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 30,
    marginTop: 8,
  },
  emptyLogsText: {
    fontSize: 16,
    color: COLORS.darkGray,
    marginTop: 12,
    marginBottom: 16,
  },
  logNewButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  logNewButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  viewMoreButton: {
    alignItems: 'center',
    padding: 12,
    marginTop: 8,
  },
  viewMoreText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});