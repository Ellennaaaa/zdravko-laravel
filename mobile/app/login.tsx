import { useState } from 'react'
import axios from 'axios'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { login } from '../src/api/auth'
import { registerForPushNotificationsAsync } from '../src/services/pushNotifications'

export default function Login() {
  const router = useRouter()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async () => {
  setError('')
  setSuccess('')

  try {
    const response = await login(formData)

    await AsyncStorage.setItem('token', response.data.token)

    setSuccess(response.data.message)

    try {
      await registerForPushNotificationsAsync()
    } catch (pushError) {
      console.log('Push notification registration failed:', pushError)
    }

    router.replace('/dashboard')
  } catch (err: unknown) {
  if (axios.isAxiosError(err) && err.response?.status === 422) {
    const errors = err.response.data.errors
    setError(Object.values(errors).flat().join(', '))
  } else if (axios.isAxiosError(err)) {
    setError(err.response?.data?.message || 'Something went wrong')
  } else {
    setError('Something went wrong')
  }
}
}

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Login</Text>

        {success && <Text style={styles.success}>{success}</Text>}
        {error && <Text style={styles.error}>{error}</Text>}

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Lozinka"
          value={formData.password}
          onChangeText={(text) => setFormData({ ...formData, password: text })}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Uloguj se</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Nemate nalog?{' '}
          <Text style={styles.link} onPress={() => router.push('/register')}>
            Registruj se
          </Text>
        </Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0f7fa',
    padding: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 30,
    borderRadius: 10,
    width: '100%',
    maxWidth: 350,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3f51b5',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#b2ebf2',
    fontSize: 14,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#3f51b5',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  footerText: {
    textAlign: 'center',
    marginTop: 15,
    fontSize: 14,
  },
  link: {
    color: '#00acc1',
    fontWeight: 'bold',
  },
  error: {
    color: '#d32f2f',
    marginBottom: 10,
    textAlign: 'center',
  },
  success: {
    color: '#00796b',
    marginBottom: 10,
    textAlign: 'center',
  },
})