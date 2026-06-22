import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { usePathname } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUser } from '../src/api/auth';
import BottomNav from '../components/BottomNav';
import SosButton from '../components/SosButton'

const PUBLIC_ROUTES = ['/login', '/register', '/index', '/'];

function RootLayoutNav() {
  const [user, setUser] = useState(null);
  const pathname = usePathname();
  const isPublic = PUBLIC_ROUTES.includes(pathname);

  useEffect(() => {
    const fetchUser = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      try {
        const response = await getUser();
        setUser(response.data.user);
      } catch {
        await AsyncStorage.removeItem('token');
        setUser(null);
      }
    };
    fetchUser();
  }, [pathname]);

  return (
    <View style={{ flex: 1 }}>
      {!isPublic && user && <BottomNav user={user} />}

      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#f5fafa' } }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="dashboard" />
          <Stack.Screen name="measurements" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="therapies" />
          <Stack.Screen name="emergency-contacts" />
          <Stack.Screen name="admin" />
        </Stack>
      </View>

       {!isPublic && user && <SosButton user={user} />}
    </View>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <RootLayoutNav />
    </SafeAreaProvider>
  );
}