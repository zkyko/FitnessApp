import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
import { supabase } from '../services/supabaseClient';

// Mock user data
const USER = {
  name: 'Alex Johnson',
  email: 'alex.johnson@example.com',
  joinDate: 'March 2023',
  avatar: require('../assets/fitness-logo.png'),
  level: 12,
  totalXP: 12550,
  stats: {
    workoutsCompleted: 87,
    streakDays: 32,
    caloriesBurned: 24680,
    hoursActive: 65,
  },
  achievements: {
    total: 24,
    unlocked: 15,
  },
  preferences: {
    notifications: true,
    darkMode: false,
    weeklyGoals: true,
    units: 'imperial', // or 'metric'
  }
};

const ProfileScreen = ({ navigation }) => {
  // State for toggles
  const [notificationsEnabled, setNotificationsEnabled] = useState(USER.preferences.notifications);
  const [darkModeEnabled, setDarkModeEnabled] = useState(USER.preferences.darkMode);
  const [weeklyGoalsEnabled, setWeeklyGoalsEnabled] = useState(USER.preferences.weeklyGoals);
  const [unitsValue, setUnitsValue] = useState(USER.preferences.units);

  // Handle logout
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigation.replace('Login');
    } catch (error) {
      console.error('Error signing out:', error);
      // In development mode, still navigate to login
      navigation.replace('Login');
    }
  };

  // Stat item component
  const StatItem = ({ icon, value, label }) => (
    <View style={styles.statItem}>
      <View style={styles.statIconContainer}>
        <Ionicons name={icon} size={20} color={COLORS.primary} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  // Settings section item component
  const SettingsItem = ({ icon, title, value, onToggle, type = 'toggle' }) => (
    <View style={styles.settingsItem}>
      <View style={styles.settingsItemLeft}>
        <View style={styles.settingsIconContainer}>
          <Ionicons name={icon} size={20} color={COLORS.primary} />
        </View>
        <Text style={styles.settingsTitle}>{title}</Text>
      </View>
      
      {type === 'toggle' ? (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
          thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : value ? '#FFFFFF' : '#F5F5F5'}
          ios_backgroundColor={COLORS.lightGray}
        />
      ) : type === 'select' ? (
        <View style={styles.unitSelector}>
          <TouchableOpacity
            style={[
              styles.unitOption,
              value === 'metric' && styles.unitOptionActive,
            ]}
            onPress={() => onToggle('metric')}
          >
            <Text
              style={[
                styles.unitText,
                value === 'metric' && styles.unitTextActive,
              ]}
            >
              Metric
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.unitOption,
              value === 'imperial' && styles.unitOptionActive,
            ]}
            onPress={() => onToggle('imperial')}
          >
            <Text
              style={[
                styles.unitText,
                value === 'imperial' && styles.unitTextActive,
              ]}
            >
              Imperial
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity>
          <Ionicons name="chevron-forward" size={20} color={COLORS.darkGray} />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* User profile header */}
        <View style={styles.header}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={styles.headerGradient}
          >
            <Image source={USER.avatar} style={styles.avatar} />
            <Text style={styles.userName}>{USER.name}</Text>
            <Text style={styles.userEmail}>{USER.email}</Text>
            
            <View style={styles.levelContainer}>
              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>
                  LVL {USER.level}
                </Text>
              </View>
              <Text style={styles.xpText}>
                {USER.totalXP.toLocaleString()} XP
              </Text>
            </View>
            
            <View style={styles.memberSince}>
              <Text style={styles.memberSinceText}>
                Member since {USER.joinDate}
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* User stats section */}
        <View style={styles.statsContainer}>
          <StatItem 
            icon="fitness-outline" 
            value={USER.stats.workoutsCompleted} 
            label="Workouts" 
          />
          <StatItem 
            icon="flame-outline" 
            value={USER.stats.streakDays} 
            label="Day Streak" 
          />
          <StatItem 
            icon="flash-outline" 
            value={USER.stats.caloriesBurned.toLocaleString()} 
            label="Calories" 
          />
          <StatItem 
            icon="time-outline" 
            value={USER.stats.hoursActive} 
            label="Hours" 
          />
        </View>

        {/* Achievements summary */}
        <TouchableOpacity 
          style={styles.achievementsCard}
          onPress={() => navigation.navigate('GoalsTab')}
        >
          <View style={styles.achievementsContent}>
            <View style={styles.achievementsTextContainer}>
              <Text style={styles.achievementsTitle}>My Achievements</Text>
              <Text style={styles.achievementsSubtitle}>
                You've unlocked {USER.achievements.unlocked} of {USER.achievements.total} badges
              </Text>
            </View>
            <View style={styles.achievementsBadge}>
              <Text style={styles.achievementsBadgeText}>
                {Math.round((USER.achievements.unlocked / USER.achievements.total) * 100)}%
              </Text>
            </View>
          </View>
          <View style={styles.achievementsProgressBar}>
            <View 
              style={[
                styles.achievementsProgressFill,
                { width: `${(USER.achievements.unlocked / USER.achievements.total) * 100}%` }
              ]} 
            />
          </View>
        </TouchableOpacity>

        {/* Settings section */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <View style={styles.settingsCard}>
            <SettingsItem 
              icon="notifications-outline" 
              title="Notifications" 
              value={notificationsEnabled}
              onToggle={setNotificationsEnabled}
            />
            <SettingsItem 
              icon="moon-outline" 
              title="Dark Mode" 
              value={darkModeEnabled}
              onToggle={setDarkModeEnabled}
            />
            <SettingsItem 
              icon="calendar-outline" 
              title="Weekly Goal Reminders" 
              value={weeklyGoalsEnabled}
              onToggle={setWeeklyGoalsEnabled}
            />
            <SettingsItem 
              icon="options-outline" 
              title="Units" 
              value={unitsValue}
              onToggle={setUnitsValue}
              type="select"
            />
          </View>
        </View>

        {/* Account section */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <View style={styles.settingsCard}>
            <SettingsItem 
              icon="person-outline" 
              title="Edit Profile" 
              type="link"
              onToggle={() => {}}
            />
            <SettingsItem 
              icon="shield-outline" 
              title="Privacy & Security" 
              type="link"
              onToggle={() => {}}
            />
            <SettingsItem 
              icon="help-circle-outline" 
              title="Help & Support" 
              type="link"
              onToggle={() => {}}
            />
            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* App version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>FitJourney v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    height: 260,
    overflow: 'hidden',
  },
  headerGradient: {
    padding: 20,
    paddingTop: 30,
    alignItems: 'center',
    height: '100%',
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  levelBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginRight: 8,
  },
  levelText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  xpText: {
    color: '#fff',
    fontSize: 14,
  },
  memberSince: {
    marginTop: 16,
  },
  memberSinceText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginTop: -30,
    borderRadius: 16,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(67, 97, 238, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginTop: 2,
  },
  achievementsCard: {
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 16,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  achievementsContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  achievementsTextContainer: {
    flex: 1,
  },
  achievementsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  achievementsSubtitle: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginTop: 4,
  },
  achievementsBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementsBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  achievementsProgressBar: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  achievementsProgressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  settingsSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  settingsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  settingsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(67, 97, 238, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingsTitle: {
    fontSize: 16,
    color: COLORS.text,
  },
  unitSelector: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  unitOption: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: COLORS.background,
  },
  unitOptionActive: {
    backgroundColor: COLORS.primary,
  },
  unitText: {
    fontSize: 14,
    color: COLORS.text,
  },
  unitTextActive: {
    color: '#fff',
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  logoutText: {
    color: COLORS.error,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  versionContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  versionText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
});

export default ProfileScreen;