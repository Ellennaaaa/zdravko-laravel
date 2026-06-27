import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { register } from '../src/api/auth'
import { Picker } from '@react-native-picker/picker'
import DateTimePicker from '@react-native-community/datetimepicker'

export default function Register() {
    const router = useRouter()
    const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone_number: '',
    role: 'patient',
    birth_date: '',
    diabetes_type_id: 1,
    })
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)
    const [showDatePicker, setShowDatePicker] = useState(false)

    const handleSubmit = async () => {
        console.log('Submit pressed')
        console.log('Form data:', JSON.stringify(formData))
        setError(null)
        setSuccess(null)
        try {
            console.log('Making API call...')
            const response = await register(formData)
            console.log('Response:', JSON.stringify(response.data))
            await AsyncStorage.setItem('token', response.data.token)
            setSuccess(response.data.message)
                router.replace('/dashboard')
        } catch (err) {
            console.log('Caught error:', err.message)
            console.log('Response data:', JSON.stringify(err.response?.data))
            if (err.response?.status === 422) {
            const errors = err.response.data.errors
            setError(Object.values(errors).flat().join(', '))
            } else {
            setError(err.response?.data?.message || '!')
            }
        }
        }

    return (
    <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
        <Text style={styles.title}>Registracija</Text>

        {success && <Text style={styles.success}>{success}</Text>}
        {error && <Text style={styles.error}>{error}</Text>}

        <TextInput
            style={styles.input}
            placeholder="Username"
              placeholderTextColor="#999"
            value={formData.username}
            onChangeText={(text) => setFormData({ ...formData, username: text })}
            autoCapitalize="none"
        />

        <TextInput
            style={styles.input}
            placeholder="Email"
              placeholderTextColor="#999"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
        />

        <TextInput
            style={styles.input}
            placeholder="Lozinka"
              placeholderTextColor="#999"
            value={formData.password}
            onChangeText={(text) => setFormData({ ...formData, password: text })}
            secureTextEntry
        />

        <TextInput
          style={styles.input}
          placeholder="Potvrdi lozinku"
            placeholderTextColor="#999"
          value={formData.password_confirmation}
          onChangeText={(text) => setFormData({ ...formData, password_confirmation: text })}
          secureTextEntry
        />

        <TextInput
          style={styles.input}
          placeholder="Broj telefona"
          placeholderTextColor="#999"
          value={formData.phone_number}
          onChangeText={(text) => setFormData({ ...formData, phone_number: text })}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Uloga</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={formData.role}
            onValueChange={(value) => setFormData({ ...formData, role: value })}
            style={{ color: '#000' }}
            dropdownIconColor="#000"
          >
            <Picker.Item label="Pacijent" value="patient" />
            <Picker.Item label="Kontakt" value="contact" />
          </Picker>
        </View>

        {formData.role === 'patient' && (
          <>
            <TouchableOpacity
                style={styles.input}
                onPress={() => setShowDatePicker(true)}
            >
                <Text>
                    {formData.birth_date || 'Izaberi datum rodjenja'}
                </Text>
            </TouchableOpacity>

            {showDatePicker && (
                <DateTimePicker
                    value={formData.birth_date ? new Date(formData.birth_date) : new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                        setShowDatePicker(false)
                        if (selectedDate) {
                            const formatted = selectedDate.toISOString().split('T')[0]
                            setFormData({ ...formData, birth_date: formatted })
                        }
                    }}
                />
            )}

            <Text style={styles.label}>Tip dijabetesa</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={formData.diabetes_type_id}
                onValueChange={(value) => setFormData({ ...formData, diabetes_type_id: value })}
                style={{ color: '#000' }}
                dropdownIconColor="#000"
              >
                <Picker.Item label="Dijabetes tipa 1" value={1} />
                <Picker.Item label="Dijabetes tipa 2" value={2} />
              </Picker>
            </View>
          </>
        )}

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Registruj se</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Already have an account?{' '}
          <Text style={styles.link} onPress={() => router.push('/login')}>
            Login
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
  label: {
    fontSize: 13,
    color: '#555',
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#b2ebf2',
    fontSize: 14,
    marginBottom: 10,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#b2ebf2',
    borderRadius: 6,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#3f51b5',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
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