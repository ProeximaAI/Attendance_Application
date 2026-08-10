import { Redirect } from 'expo-router';
import { useContext } from 'react';
import { View } from 'react-native';
import { AuthContext } from '../context/AuthContext';
export default function Index() {
  const { user, isLoading, isFirstLaunch } = useContext(AuthContext);

  if (isLoading) {
    // Return a blank view that matches the splash screen background while loading
    return <View style={{ flex: 1, backgroundColor: '#FFFFFF' }} />;
  }

  if (isFirstLaunch) {
    return <Redirect href="/welcome" />;
  } else if (!user) {
    return <Redirect href="/login" />;
  } else {
    if (user.is_first_login === 1) {
      return <Redirect href="/reset-password" />;
    }
    return <Redirect href="/(tabs)" />;
  }
}


