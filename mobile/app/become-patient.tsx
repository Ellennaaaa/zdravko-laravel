import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { router } from 'expo-router'
import { becomePatient } from '../src/api/profile'

export default function BecomePatientScreen() {
  const [birthDate, setBirthDate] = useState('')
  const [diabetesTypeId, setDiabetesTypeId] = useState('1')

  const handleSubmit = async () => {
    try {
      await becomePatient({
        birth_date: birthDate,
        diabetes_type_id: Number(diabetesTypeId),
      })

      Alert.alert('Success', 'You are now registered as a patient.')
      router.replace('/dashboard')
    } catch (err: any) {
      Alert.alert(
        'Error',
        err.response?.data?.message ||
          err.response?.data?.error ||
          'Something went wrong.'
      )
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Become Patient</Text>

      <TextInput
        placeholder="Birth date: YYYY-MM-DD"
          placeholderTextColor="#999"
        value={birthDate}
        onChangeText={setBirthDate}
        style={styles.input}
      />

      <TextInput
        placeholder="Diabetes type ID: 1 or 2"
          placeholderTextColor="#999"
        value={diabetesTypeId}
        onChangeText={setDiabetesTypeId}
        keyboardType="numeric"
        style={styles.input}
      />

      <TouchableOpacity onPress={handleSubmit} style={styles.button}>
        <Text style={styles.buttonText}>Confirm</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#e0f7fa' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#3f51b5', textAlign: 'center', marginBottom: 24 },
  input: { backgroundColor: 'white', padding: 14, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#b2ebf2' },
  button: { backgroundColor: '#3f51b5', padding: 14, borderRadius: 8 },
  buttonText: { color: 'white', textAlign: 'center', fontWeight: 'bold' },
})