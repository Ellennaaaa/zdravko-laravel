import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  useEffect(() => {
    AsyncStorage.removeItem('token');
  }, []);
  
  return <Redirect href="/login" />;
}