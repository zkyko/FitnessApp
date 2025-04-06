import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
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

const windowWidth = Dimensions.get('window').width;

// Mock workout data
const WORKOUTS = [
  {
    id: '1',
    title: 'Morning HIIT',
    duration: '25 min',
    calories: '320',
    intensity: 'High',
    category: 'cardio',
    image: require('../assets/fitness-logo.png'),
    progress: 75,
    xp: 120,
  },
  {
    id: '2',
    title: 'Upper Body Strength',
    duration: '40 min',
    calories: '280',
    intensity: 'Medium',
    category: 'strength',
    image: require('../assets/fitness-logo.png'),
    progress: 50,
    xp: 80,
  },
  {
    id: '3',
    title: 'Core Crusher',
    duration: '20 min',
    calories: '180',
    intensity: 'Medium',
    category: 'strength',
    image: require('../assets/fitness-logo.png'),
    progress: 100,
    xp: 150,
  },
  {
    id: '4',
    title: 'Yoga Flow',
    duration: '35 min',
    calories: '200',
    intensity: 'Low',
    category: 'flexibility',
    image: require('../assets/fitness-logo.png'),
    progress: 25,
    xp: 60,
  },
];

// Workout categories with icons
const CATEGORIES = [
  { id: 'all', name: 'All', icon: 'fitness-outline' },
  { id: 'cardio', name: 'Cardio', icon: 'heart-outline' },
  { id: 'strength', name: 'Strength', icon: 'barbell-outline' },
  { id: 'flexibility', name: 'Flexibility', icon: 'body-outline' },
  { id: 'custom', name: 'Custom', icon: 'add-circle-outline' },
];

const WorkoutScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filterActive, setFilterActive] = useState(false);

  // Filter workouts based on selected category
  const filteredWorkouts = selectedCategory === 'all' 
    ? WORKOUTS 
    : WORKOUTS.filter(workout => workout.category === selectedCategory);

  // Progress bar component
  const ProgressBar = ({ progress }) => (
    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBar, { width: `${progress}%` }]} />
    </View>
  );

  // Workout card component
  const WorkoutCard = ({ item, onPress }) => (
    <TouchableOpacity 
      style={styles.workoutCard}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Image source={item.image} style={styles.workoutImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.cardOverlay}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.workoutTitle}>{item.title}</Text>
            <View style={styles.xpContainer}>
              <Ionicons name="flash" size={14} color={COLORS.warning} />
              <Text style={styles.xpText}>{item.xp} XP</Text>
            </View>
          </View>
          
          <View style={styles.workoutStats}>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={14} color="#fff" />
              <Text style={styles.statText}>{item.duration}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="flame-outline" size={14} color="#fff" />
              <Text style={styles.statText}>{item.calories} cal</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="speedometer-outline" size={14} color="#fff" />
              <Text style={styles.statText}>{item.intensity}</Text>
            </View>
          </View>
          
          <ProgressBar progress={item.progress} />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Weekly stats summary */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.weeklyStatsContainer}>
          <Text style={styles.sectionTitle}>Weekly Progress</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>5</Text>
              <Text style={styles.statLabel}>Workouts</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>320</Text>
              <Text style={styles.statLabel}>Minutes</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>1,842</Text>
              <Text style={styles.statLabel}>Calories</Text>
            </View>
          </View>
        </View>

        {/* Categories filter */}
        <View style={styles.categoriesContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={CATEGORIES}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.categoryButton,
                  selectedCategory === item.id && styles.categoryActive,
                ]}
                onPress={() => {
                  setSelectedCategory(item.id);
                  setFilterActive(true);
                }}
              >
                <Ionicons
                  name={item.icon}
                  size={16}
                  color={selectedCategory === item.id ? '#fff' : COLORS.darkGray}
                />
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === item.id && styles.categoryTextActive,
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {/* Workouts list */}
        <View style={styles.workoutsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Workouts</Text>
            {filterActive && selectedCategory !== 'all' && (
              <TouchableOpacity 
                style={styles.clearFilterButton}
                onPress={() => {
                  setSelectedCategory('all');
                  setFilterActive(false);
                }}
              >
                <Text style={styles.clearFilterText}>Clear Filter</Text>
                <Ionicons name="close-circle" size={16} color={COLORS.primary} />
              </TouchableOpacity>
            )}
          </View>

          {filteredWorkouts.map((workout) => (
            <WorkoutCard
              key={workout.id}
              item={workout}
              onPress={() => {
                // Navigate to workout details
                console.log(`Workout selected: ${workout.title}`);
              }}
            />
          ))}
        </View>
      </ScrollView>

      {/* Floating action button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => console.log('Add new workout')}
      >
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={30} color="#FFF" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  weeklyStatsContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 15,
    margin: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginTop: 4,
  },
  categoriesContainer: {
    marginBottom: 10,
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.darkGray,
    marginLeft: 6,
  },
  categoryTextActive: {
    color: '#fff',
  },
  workoutsContainer: {
    padding: 16,
    paddingTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clearFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearFilterText: {
    fontSize: 14,
    color: COLORS.primary,
    marginRight: 4,
  },
  workoutCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    height: 200,
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
  workoutImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  cardContent: {
    padding: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  xpText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  workoutStats: {
    flexDirection: 'row',
    marginVertical: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  statText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 4,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 3,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    zIndex: 1,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
});

export default WorkoutScreen;