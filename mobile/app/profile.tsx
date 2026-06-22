import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { logout } from '../src/api/auth'
import { useEffect, useState } from 'react'
import { getUser } from '../src/api/auth'

export default function Profile() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getUser()
        setUser(response.data.user)
      } catch {
        router.replace('/login')
      }
    }
    fetchUser()
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
    } catch {}
    await AsyncStorage.removeItem('token')
    router.replace('/login')
  }

  const roles = user?.roles?.map((role: any) => role.name).join(', ')

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Ucitavanje...</Text>
      </View>
    )
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.username?.charAt(0)?.toUpperCase()}
          </Text>
        </View>

        <Text style={styles.title}>Moj Profil</Text>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Korisnicko ime:</Text>
          <Text style={styles.value}>{user?.username}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{user?.email}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Broj telefona:</Text>
          <Text style={styles.value}>{user?.phone_number}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Uloga:</Text>
          <Text style={styles.value}>{roles}</Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Odjavite se</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f5fafa',
  },
  card: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3f51b5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  avatarText: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3f51b5',
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  label: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
    marginRight: 6,
  },
  value: {
    fontSize: 14,
    color: '#555',
  },
  logoutButton: {
    marginTop: 24,
    backgroundColor: '#d32f2f',
    padding: 14,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
  },
})