import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
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

// Mock meal data
const MEALS = [
  {
    id: '1',
    type: 'breakfast',
    title: 'Protein Oatmeal Bowl',
    time: '8:30 AM',
    calories: 380,
    protein: 25,
    carbs: 45,
    fat: 12,
    image: require('../assets/fitness-logo.png'),
    completed: true,
    xp: 35,
  },
  {
    id: '2',
    type: 'lunch',
    title: 'Grilled Chicken Salad',
    time: '1:15 PM',
    calories: 520,
    protein: 40,
    carbs: 25,
    fat: 25,
    image: require('../assets/fitness-logo.png'),
    completed: true,
    xp: 50,
  },
  {
    id: '3',
    type: 'snack',
    title: 'Greek Yogurt & Berries',
    time: '4:00 PM',
    calories: 180,
    protein: 15,
    carbs: 20,
    fat: 3,
    image: require('../assets/fitness-logo.png'),
    completed: false,
    xp: 20,
  },
  {
    id: '4',
    type: 'dinner',
    title: 'Salmon with Roasted Veggies',
    time: '7:30 PM',
    calories: 650,
    protein: 42,
    carbs: 30,
    fat: 38,
    image: require('../assets/fitness-logo.png'),
    completed: false,
    xp: 55,
  },
];

// Meal categories/types
const MEAL_TYPES = [
  { id: 'all', label: 'All Meals' },
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
  { id: 'snack', label: 'Snacks' },
];

// Nutrition summary data
const NUTRITION_SUMMARY = {
  caloriesConsumed: 1080,
  caloriesGoal: 2200,
  caloriesRemaining: 1120,
  protein: { consumed: 80, goal: 150 },
  carbs: { consumed: 90, goal: 220 },
  fat: { consumed: 40, goal: 70 },
};

const MealScreen = ({ navigation }) => {
  const [selectedType, setSelectedType] = useState('all');

  // Filter meals based on selected type
  const filteredMeals = selectedType === 'all'
    ? MEALS
    : MEALS.filter(meal => meal.type === selectedType);

  // Donut chart for calories
  const CaloriesDonut = () => {
    const percentage = Math.min(100, Math.round((NUTRITION_SUMMARY.caloriesConsumed / NUTRITION_SUMMARY.caloriesGoal) * 100));
    const circumference = 2 * Math.PI * 45; // radius = 45
    const strokeDashoffset = circumference * (1 - percentage / 100);
    
    return (
      <View style={styles.donutContainer}>
        <View style={styles.donutSvg}>
          <View style={styles.donutBackground} />
          <View
            style={[
              styles.donutProgress,
              {
                strokeDasharray: circumference,
                strokeDashoffset: strokeDashoffset,
                transform: [{ rotate: '-90deg' }],
              },
            ]}
          />
          <View style={styles.donutTextContainer}>
            <Text style={styles.donutPercentage}>{percentage}%</Text>
            <Text style={styles.donutLabel}>of goal</Text>
          </View>
        </View>
        <View style={styles.caloriesSummary}>
          <View style={styles.caloriesItem}>
            <View style={[styles.caloriesDot, { backgroundColor: COLORS.primary }]} />
            <View>
              <Text style={styles.caloriesValue}>{NUTRITION_SUMMARY.caloriesConsumed}</Text>
              <Text style={styles.caloriesLabel}>Consumed</Text>
            </View>
          </View>
          <View style={styles.caloriesItem}>
            <View style={[styles.caloriesDot, { backgroundColor: COLORS.lightGray }]} />
            <View>
              <Text style={styles.caloriesValue}>{NUTRITION_SUMMARY.caloriesRemaining}</Text>
              <Text style={styles.caloriesLabel}>Remaining</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  // Nutrition progress bar component
  const NutrientProgressBar = ({ label, consumed, goal, color }) => {
    const percentage = Math.min(100, Math.round((consumed / goal) * 100));
    
    return (
      <View style={styles.nutrientContainer}>
        <View style={styles.nutrientHeader}>
          <Text style={styles.nutrientLabel}>{label}</Text>
          <Text style={styles.nutrientValues}>
            {consumed}g <Text style={styles.nutrientGoal}>/ {goal}g</Text>
          </Text>
        </View>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${percentage}%`, backgroundColor: color },
            ]}
          />
        </View>
      </View>
    );
  };

  // Meal card component
  const MealCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.mealCard}
      onPress={() => console.log(`Meal selected: ${item.title}`)}
    >
      <Image source={item.image} style={styles.mealImage} />
      <View style={styles.mealContent}>
        <View style={styles.mealHeader}>
          <View style={styles.mealTypeContainer}>
            <Text style={styles.mealType}>
              {MEAL_TYPES.find(type => type.id === item.type)?.label}
            </Text>
            <Text style={styles.mealTime}>{item.time}</Text>
          </View>
          {item.completed ? (
            <View style={styles.completedBadge}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.logButton}
              onPress={() => console.log(`Log meal: ${item.title}`)}
            >
              <Text style={styles.logButtonText}>Log</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <Text style={styles.mealTitle}>{item.title}</Text>
        
        <View style={styles.macrosContainer}>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{item.calories}</Text>
            <Text style={styles.macroLabel}>calories</Text>
          </View>
          <View style={styles.macrosSeparator} />
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{item.protein}g</Text>
            <Text style={styles.macroLabel}>protein</Text>
          </View>
          <View style={styles.macrosSeparator} />
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{item.carbs}g</Text>
            <Text style={styles.macroLabel}>carbs</Text>
          </View>
          <View style={styles.macrosSeparator} />
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{item.fat}g</Text>
            <Text style={styles.macroLabel}>fat</Text>
          </View>
        </View>

        {item.completed && (
          <View style={styles.xpBadge}>
            <Ionicons name="flash" size={12} color={COLORS.warning} />
            <Text style={styles.xpText}>{item.xp} XP</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Nutrition summary card */}
        <View style={styles.nutritionCard}>
          <Text style={styles.sectionTitle}>Daily Nutrition</Text>
          
          <View style={styles.caloriesContainer}>
            <CaloriesDonut />
          </View>
          
          <View style={styles.macronutrients}>
            <NutrientProgressBar
              label="Protein"
              consumed={NUTRITION_SUMMARY.protein.consumed}
              goal={NUTRITION_SUMMARY.protein.goal}
              color="#FF9800" // Orange
            />
            <NutrientProgressBar
              label="Carbs"
              consumed={NUTRITION_SUMMARY.carbs.consumed}
              goal={NUTRITION_SUMMARY.carbs.goal}
              color="#4CAF50" // Green
            />
            <NutrientProgressBar
              label="Fat"
              consumed={NUTRITION_SUMMARY.fat.consumed}
              goal={NUTRITION_SUMMARY.fat.goal}
              color="#F44336" // Red
            />
          </View>
        </View>

        {/* Meal type tabs */}
        <View style={styles.mealTypesContainer}>
          <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.mealTypesTabs}
          >
            {MEAL_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.mealTypeTab,
                  selectedType === type.id && styles.mealTypeTabActive,
                ]}
                onPress={() => setSelectedType(type.id)}
              >
                <Text
                  style={[
                    styles.mealTypeText,
                    selectedType === type.id && styles.mealTypeTextActive,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Meals list */}
        <View style={styles.mealsList}>
          {filteredMeals.map((meal) => (
            <MealCard key={meal.id} item={meal} />
          ))}
        </View>
      </ScrollView>

      {/* Add meal button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => console.log('Add new meal')}
      >
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={styles.addButtonGradient}
        >
          <Ionicons name="add" size={24} color="#FFF" />
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
  nutritionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    margin: 16,
    marginBottom: 8,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  caloriesContainer: {
    marginVertical: 12,
  },
  donutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  donutSvg: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  donutBackground: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 10,
    borderColor: COLORS.lightGray,
    position: 'absolute',
  },
  donutProgress: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 10,
    borderColor: COLORS.primary,
    position: 'absolute',
  },
  donutTextContainer: {
    alignItems: 'center',
  },
  donutPercentage: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  donutLabel: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  caloriesSummary: {
    flex: 1,
    marginLeft: 16,
  },
  caloriesItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  caloriesDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  caloriesValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  caloriesLabel: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  macronutrients: {
    marginTop: 8,
  },
  nutrientContainer: {
    marginBottom: 12,
  },
  nutrientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  nutrientLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  nutrientValues: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  nutrientGoal: {
    color: COLORS.darkGray,
    fontWeight: 'normal',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  mealTypesContainer: {
    marginBottom: 8,
  },
  mealTypesTabs: {
    paddingHorizontal: 16,
  },
  mealTypeTab: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  mealTypeTabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  mealTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.darkGray,
  },
  mealTypeTextActive: {
    color: '#fff',
  },
  mealsList: {
    padding: 16,
    paddingTop: 8,
  },
  mealCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
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
  mealImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  mealContent: {
    padding: 16,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  mealTypeContainer: {
    flexDirection: 'column',
  },
  mealType: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  mealTime: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginTop: 2,
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginVertical: 12,
  },
  macrosContainer: {
    flexDirection: 'row',
    marginTop: 4,
  },
  macroItem: {
    flex: 1,
    alignItems: 'center',
  },
  macrosSeparator: {
    width: 1,
    backgroundColor: COLORS.border,
    marginVertical: 4,
  },
  macroValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  macroLabel: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  completedBadge: {
    padding: 4,
  },
  logButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  logButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  xpBadge: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  xpText: {
    color: COLORS.warning,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
  },
  addButtonGradient: {
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

export default MealScreen;