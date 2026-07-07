import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useContext } from 'react';
import { TouchableOpacity, useColorScheme, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/theme';
import { CheckInContext } from '../../context/CheckInContext';

const CustomTabBarButton = ({ onPress }: any) => (
  <TouchableOpacity
    activeOpacity={1} // Prevents the weird fading/hover effect when pressed
    style={{
      top: -35, // Adjusts overlap to sit exactly halfway out of the navbar
      justifyContent: 'center',
      alignItems: 'center',
    }}
    onPress={onPress}
  >
    <View style={{
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: COLORS.primary,
      borderWidth: 6,
      borderColor: '#FFFFFF', // White border seamlessly blends into the navbar to create a "bulge" instead of a cutout
      justifyContent: 'center',
      alignItems: 'center',
      // The shadow MUST be on this element (which has a background color) for Android to display it
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 8,
    }}>
      <View style={{ justifyContent: 'center', alignItems: 'center', width: 36, height: 36 }}>
        <View style={{ position: 'absolute', top: 0, left: 0, width: 12, height: 12, borderTopWidth: 2.5, borderLeftWidth: 2.5, borderColor: '#FFFFFF', borderTopLeftRadius: 12 }} />
        <View style={{ position: 'absolute', top: 0, right: 0, width: 12, height: 12, borderTopWidth: 2.5, borderRightWidth: 2.5, borderColor: '#FFFFFF', borderTopRightRadius: 12 }} />
        <View style={{ position: 'absolute', bottom: 0, left: 0, width: 12, height: 12, borderBottomWidth: 2.5, borderLeftWidth: 2.5, borderColor: '#FFFFFF', borderBottomLeftRadius: 12 }} />
        <View style={{ position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderBottomWidth: 2.5, borderRightWidth: 2.5, borderColor: '#FFFFFF', borderBottomRightRadius: 12 }} />
        <MaterialCommunityIcons name="account" size={20} color="#FFFFFF" />
      </View>
    </View>
  </TouchableOpacity>
);

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const { openCheckIn } = useContext(CheckInContext);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',

        },
        tabBarItemStyle: {
          paddingTop: 10,    // Pushes both the icon and text DOWN from the top

        },
        tabBarStyle: {
          position: 'absolute',
          bottom: Math.max(16, insets.bottom),
          left: 0,
          right: 0,
          marginHorizontal: 16,
          backgroundColor: '#FFFFFF',
          borderRadius: 35,
          height: 75,
          paddingBottom: 8,
          borderTopWidth: 0,
          elevation: 5,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
        },
        headerStyle: {
          backgroundColor: COLORS.background,
        },
        headerTintColor: COLORS.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="logs"
        options={{
          title: 'Logs',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "clipboard" : "clipboard-outline"} size={26} color={color} />
          ),
        }}
      />

      {/* Central Check-In Button */}
      <Tabs.Screen
        name="clockin"
        options={{
          title: '',
          tabBarShowLabel: false,
          headerShown: false,
          tabBarButton: (props) => (
            <CustomTabBarButton {...props} onPress={openCheckIn} />
          ),
        }}
        listeners={{
          tabPress: e => {
            // Prevent default navigation action
            e.preventDefault();
            openCheckIn();
          },
        }}
      />
      <Tabs.Screen
        name="leaves"
        options={{
          title: 'Leaves',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "calendar" : "calendar-outline"} size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "person" : "person-outline"} size={26} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
