import React, { lazy, Suspense } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

// Lazy load screens to avoid circular dependencies
const LoginScreen = lazy(() => import('../screens/LoginScreen'));
const Dashboard = lazy(() => import('../screens/Dashboard'));
const LogHabitScreen = lazy(() => import('../screens/LogHabitScreen'));
const WorkoutScreen = lazy(() => import('../screens/WorkoutScreen'));
const MealScreen = lazy(() => import('../screens/MealScreen'));
const GoalsScreen = lazy(() => import('../screens/GoalsScreen'));
const ProfileScreen = lazy(() => import('../screens/ProfileScreen'));

// Create navigators
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Loading component for Suspense fallback
const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' }}>
    <ActivityIndicator size="large" color="#4361EE" />
    <Text style={{ marginTop: 10, color: '#212529', fontSize: 16 }}>Loading...</Text>
  </View>
);

// Import colors from centralized file
import { COLORS } from '../utils/colors';

// Tab indicator badge component
const TabBadge = ({ value }) => {
  if (!value) return null;
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{value > 99 ? '99+' : value}</Text>
    </View>
  );
};

// Main Tab Navigator
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'WorkoutTab') {
            iconName = focused ? 'barbell' : 'barbell-outline';
          } else if (route.name === 'MealTab') {
            iconName = focused ? 'restaurant' : 'restaurant-outline';
          } else if (route.name === 'GoalsTab') {
            iconName = focused ? 'trophy' : 'trophy-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.darkGray,
        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          height: 60,
          paddingBottom: 8
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500'
        },
        headerStyle: {
          backgroundColor: COLORS.primary,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      })}
    >
      <Tab.Screen 
        name="HomeTab" 
        options={{ 
          tabBarLabel: 'Home',
          title: 'Dashboard',
          headerTitleAlign: 'left',
        }}
      >
        {props => (
          <Suspense fallback={<LoadingScreen />}>
            <Dashboard {...props} />
          </Suspense>
        )}
      </Tab.Screen>
      <Tab.Screen 
        name="WorkoutTab" 
        options={{ 
          tabBarLabel: 'Workout',
          title: 'Workouts',
          tabBarBadge: () => <TabBadge value={3} />,
        }}
      >
        {props => (
          <Suspense fallback={<LoadingScreen />}>
            <WorkoutScreen {...props} />
          </Suspense>
        )}
      </Tab.Screen>
      <Tab.Screen 
        name="MealTab" 
        options={{ 
          tabBarLabel: 'Meals',
          title: 'Nutrition',
        }}
      >
        {props => (
          <Suspense fallback={<LoadingScreen />}>
            <MealScreen {...props} />
          </Suspense>
        )}
      </Tab.Screen>
      <Tab.Screen 
        name="GoalsTab" 
        options={{ 
          tabBarLabel: 'Goals',
          title: 'Your Goals',
        }}
      >
        {props => (
          <Suspense fallback={<LoadingScreen />}>
            <GoalsScreen {...props} />
          </Suspense>
        )}
      </Tab.Screen>
      <Tab.Screen 
        name="ProfileTab" 
        options={{ 
          tabBarLabel: 'Profile',
          title: 'Your Profile',
        }}
      >
        {props => (
          <Suspense fallback={<LoadingScreen />}>
            <ProfileScreen {...props} />
          </Suspense>
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

// Root Stack Navigator
export default function StackNavigator({ initialSession }) {
  // For development: bypass login and go straight to Main App
  // DEVELOPMENT MODE: Remove this line and uncomment the next line for production
  const initialRoute = 'MainApp';
  // const initialRoute = initialSession ? 'MainApp' : 'Login';

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Login">
          {props => (
            <Suspense fallback={<LoadingScreen />}>
              <LoginScreen {...props} />
            </Suspense>
          )}
        </Stack.Screen>
        <Stack.Screen name="MainApp">
          {props => (
            <Suspense fallback={<LoadingScreen />}>
              <MainTabNavigator {...props} />
            </Suspense>
          )}
        </Stack.Screen>
        
        {/* Individual Screens with their own navigation stack */}
        <Stack.Screen 
          name="LogHabit" 
          options={{ 
            headerShown: true,
            headerStyle: { backgroundColor: COLORS.primary },
            headerTintColor: '#fff',
            title: 'Log Activity'
          }} 
        >
          {props => (
            <Suspense fallback={<LoadingScreen />}>
              <LogHabitScreen {...props} />
            </Suspense>
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 4,
    right: -6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 4,
  },
});