import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
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

// Mock goals data
const GOALS = [
  {
    id: '1',
    title: 'Run 30 miles this month',
    category: 'cardio',
    icon: 'walk-outline',
    currentValue: 22.5,
    targetValue: 30,
    unit: 'miles',
    deadline: 'Oct 31, 2023',
    reward: 350,
    streakDays: 15,
    completed: false,
  },
  {
    id: '2',
    title: 'Do 5 workouts per week',
    category: 'consistency',
    icon: 'calendar-outline',
    currentValue: 4,
    targetValue: 5,
    unit: 'workouts',
    deadline: 'Weekly',
    reward: 200,
    streakDays: 3,
    completed: false,
  },
  {
    id: '3',
    title: 'Drink 2500ml water daily',
    category: 'hydration',
    icon: 'water-outline',
    currentValue: 1800,
    targetValue: 2500,
    unit: 'ml',
    deadline: 'Daily',
    reward: 100,
    streakDays: 8,
    completed: false,
  },
  {
    id: '4',
    title: 'Bench press 200 lbs',
    category: 'strength',
    icon: 'barbell-outline',
    currentValue: 185,
    targetValue: 200,
    unit: 'lbs',
    deadline: 'Dec 15, 2023',
    reward: 500,
    streakDays: 0,
    completed: false,
  },
  {
    id: '5',
    title: 'Meditate for 10 minutes daily',
    category: 'mindfulness',
    icon: 'leaf-outline',
    currentValue: 10,
    targetValue: 10,
    unit: 'minutes',
    deadline: 'Daily',
    reward: 75,
    streakDays: 21,
    completed: true,
  },
];

// Achievement badges data
const BADGES = [
  {
    id: '1',
    title: 'Early Bird',
    description: 'Complete 10 workouts before 8 AM',
    icon: 'sunrise-outline',
    progress: 80,
    unlocked: true,
  },
  {
    id: '2',
    title: 'Iron Will',
    description: 'Complete a 30-day workout streak',
    icon: 'flame-outline',
    progress: 65,
    unlocked: false,
  },
  {
    id: '3',
    title: 'Nutrition Master',
    description: 'Log your meals for 60 days',
    icon: 'nutrition-outline',
    progress: 40,
    unlocked: false,
  },
  {
    id: '4',
    title: 'Hydration Hero',
    description: 'Meet your water goals for 14 days in a row',
    icon: 'water-outline',
    progress: 100,
    unlocked: true,
  },
];

// Categories to filter goals
const CATEGORIES = [
  { id: 'all', label: 'All Goals' },
  { id: 'cardio', label: 'Cardio' },
  { id: 'strength', label: 'Strength' },
  { id: 'nutrition', label: 'Nutrition' },
  { id: 'consistency', label: 'Consistency' },
  { id: 'hydration', label: 'Hydration' },
  { id: 'mindfulness', label: 'Mindfulness' },
];

const GoalsScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedGoalId, setExpandedGoalId] = useState(null);

  // Filter goals based on selected category
  const filteredGoals = selectedCategory === 'all'
    ? GOALS
    : GOALS.filter(goal => goal.category === selectedCategory);

  // Badge card component
  const BadgeCard = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.badgeCard,
        item.unlocked && styles.badgeCardUnlocked,
      ]}
      onPress={() => console.log(`Badge ${item.title} selected`)}
    >
      <View style={[
        styles.badgeIconContainer,
        item.unlocked ? styles.badgeIconUnlocked : styles.badgeIconLocked
      ]}>
        <Ionicons 
          name={item.icon} 
          size={24} 
          color={item.unlocked ? '#fff' : COLORS.lightGray} 
        />
      </View>
      <Text style={[
        styles.badgeTitle,
        item.unlocked && styles.badgeTitleUnlocked
      ]}>
        {item.title}
      </Text>
      
      {/* Progress indicator */}
      <View style={styles.badgeProgressContainer}>
        <View style={styles.badgeProgressBar}>
          <View 
            style={[
              styles.badgeProgressFill,
              { width: `${item.progress}%` },
              item.unlocked && styles.badgeProgressFillUnlocked
            ]} 
          />
        </View>
        <Text style={styles.badgeProgressText}>
          {item.progress}%
        </Text>
      </View>
    </TouchableOpacity>
  );

  // Goal card component
  const GoalCard = ({ item }) => {
    const isExpanded = expandedGoalId === item.id;
    const progress = (item.currentValue / item.targetValue) * 100;

    // Goal icon based on category
    const goalIconName = item.icon || 'trophy-outline';
    
    return (
      <TouchableOpacity 
        style={[
          styles.goalCard,
          item.completed && styles.goalCardCompleted,
        ]}
        onPress={() => setExpandedGoalId(isExpanded ? null : item.id)}
        activeOpacity={0.9}
      >
        {/* Goal header */}
        <View style={styles.goalHeader}>
          <View style={styles.goalHeaderLeft}>
            <View style={[
              styles.goalIconContainer,
              item.completed && styles.goalIconContainerCompleted
            ]}>
              <Ionicons 
                name={goalIconName} 
                size={20} 
                color={item.completed ? '#fff' : COLORS.primary} 
              />
            </View>
            <View>
              <Text style={styles.goalTitle}>{item.title}</Text>
              <Text style={styles.goalDeadline}>
                {item.deadline}
              </Text>
            </View>
          </View>
          <Ionicons 
            name={isExpanded ? 'chevron-up' : 'chevron-down'} 
            size={20} 
            color={COLORS.darkGray} 
          />
        </View>
        
        {/* Progress section */}
        <View style={styles.goalProgress}>
          <View style={styles.goalProgressText}>
            <Text style={styles.goalProgressValue}>
              {item.currentValue} <Text style={styles.goalUnit}>of {item.targetValue} {item.unit}</Text>
            </Text>
            <Text style={styles.goalProgressPercent}>
              {Math.round(progress)}%
            </Text>
          </View>
          <View style={styles.goalProgressBar}>
            <View 
              style={[
                styles.goalProgressFill,
                { width: `${progress}%` },
                item.completed && styles.goalProgressFillCompleted
              ]} 
            />
          </View>
        </View>
        
        {/* Expanded content */}
        {isExpanded && (
          <View style={styles.goalExpanded}>
            <View style={styles.goalRow}>
              <View style={styles.goalDetail}>
                <Ionicons name="flash-outline" size={16} color={COLORS.warning} />
                <Text style={styles.goalDetailText}>
                  {item.reward} XP Reward
                </Text>
              </View>
              {item.streakDays > 0 && (
                <View style={styles.goalDetail}>
                  <Ionicons name="flame-outline" size={16} color="#ff5722" />
                  <Text style={styles.goalDetailText}>
                    {item.streakDays} day streak
                  </Text>
                </View>
              )}
            </View>
            
            {!item.completed ? (
              <TouchableOpacity 
                style={styles.updateButton}
                onPress={() => console.log(`Update goal: ${item.title}`)}
              >
                <Text style={styles.updateButtonText}>Update Progress</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                <Text style={styles.completedText}>Completed!</Text>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Level progress section */}
        <View style={styles.levelCard}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={styles.levelGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.levelInfo}>
              <View style={styles.levelBadge}>
                <Text style={styles.levelNumber}>12</Text>
              </View>
              <View style={styles.levelTexts}>
                <Text style={styles.levelLabel}>Current Level</Text>
                <Text style={styles.levelToNext}>2,450 XP to Level 13</Text>
              </View>
            </View>
            <View style={styles.levelProgressBar}>
              <View style={styles.levelProgressFill} />
            </View>
          </LinearGradient>
        </View>

        {/* Achievement badges section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Achievements</Text>
            <TouchableOpacity
              onPress={() => console.log('View all achievements')}
            >
              <Text style={styles.sectionLink}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.badgesContainer}
          >
            {BADGES.map((badge) => (
              <BadgeCard key={badge.id} item={badge} />
            ))}
          </ScrollView>
        </View>

        {/* Goals section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Goals</Text>
            <TouchableOpacity 
              style={styles.addGoalButton}
              onPress={() => console.log('Add new goal')}
            >
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={styles.addGoalText}>Add Goal</Text>
            </TouchableOpacity>
          </View>
          
          {/* Categories filter */}
          <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.id && styles.categoryButtonActive,
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category.id && styles.categoryTextActive,
                  ]}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          {/* Goals list */}
          <View style={styles.goalsList}>
            {filteredGoals.length > 0 ? (
              filteredGoals.map((goal) => (
                <GoalCard key={goal.id} item={goal} />
              ))
            ) : (
              <View style={styles.noGoalsContainer}>
                <Ionicons name="flag-outline" size={48} color={COLORS.lightGray} />
                <Text style={styles.noGoalsText}>
                  No goals in this category yet
                </Text>
                <TouchableOpacity
                  style={styles.createGoalButton}
                  onPress={() => console.log('Create goal in this category')}
                >
                  <Text style={styles.createGoalText}>Create One</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
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
  levelCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  levelGradient: {
    padding: 20,
  },
  levelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  levelNumber: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  levelTexts: {
    flex: 1,
  },
  levelLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
  },
  levelToNext: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  levelProgressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    marginTop: 16,
  },
  levelProgressFill: {
    height: '100%',
    width: '65%',
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  sectionLink: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  badgesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  badgeCard: {
    width: 120,
    padding: 12,
    borderRadius: 16,
    backgroundColor: COLORS.card,
    marginRight: 12,
    alignItems: 'center',
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
  badgeCardUnlocked: {
    backgroundColor: 'rgba(67, 97, 238, 0.1)',
  },
  badgeIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: COLORS.border,
  },
  badgeIconUnlocked: {
    backgroundColor: COLORS.primary,
  },
  badgeIconLocked: {
    backgroundColor: COLORS.border,
  },
  badgeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  badgeTitleUnlocked: {
    color: COLORS.primary,
  },
  badgeProgressContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeProgressBar: {
    flex: 1,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginRight: 8,
  },
  badgeProgressFill: {
    height: '100%',
    backgroundColor: COLORS.lightGray,
  },
  badgeProgressFillUnlocked: {
    backgroundColor: COLORS.primary,
  },
  badgeProgressText: {
    fontSize: 10,
    color: COLORS.darkGray,
  },
  addGoalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  addGoalText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 4,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  categoryTextActive: {
    color: '#fff',
    fontWeight: '500',
  },
  goalsList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  goalCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
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
  goalCardCompleted: {
    borderColor: COLORS.success,
    borderWidth: 1,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  goalIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(67, 97, 238, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  goalIconContainerCompleted: {
    backgroundColor: COLORS.success,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    flexShrink: 1,
  },
  goalDeadline: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginTop: 2,
  },
  goalProgress: {
    marginTop: 16,
  },
  goalProgressText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  goalProgressValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  goalUnit: {
    fontWeight: 'normal',
    color: COLORS.darkGray,
  },
  goalProgressPercent: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  goalProgressBar: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  goalProgressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  goalProgressFillCompleted: {
    backgroundColor: COLORS.success,
  },
  goalExpanded: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  goalRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  goalDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  goalDetailText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 6,
  },
  updateButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 8,
  },
  completedText: {
    color: COLORS.success,
    fontWeight: '600',
    marginLeft: 8,
  },
  noGoalsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  noGoalsText: {
    fontSize: 16,
    color: COLORS.darkGray,
    marginTop: 12,
    marginBottom: 16,
  },
  createGoalButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  createGoalText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default GoalsScreen;