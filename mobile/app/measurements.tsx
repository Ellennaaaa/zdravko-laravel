import { useEffect, useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { Picker } from '@react-native-picker/picker'
import { getMeasurements, storeMeasurement, updateMeasurement, deleteMeasurement } from '../src/api/measurements'
import { formatDate, formatDateTime } from '../src/utils/dateUtils'

export default function Measurements() {
  const [measurements, setMeasurements] = useState([])
  const today = new Date().toISOString().split('T')[0]

  const [formData, setFormData] = useState({
    value: '',
    blood_glucose_unit_id: 1,
    measured_on: today,
  })
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
  fetchMeasurements()

  const interval = setInterval(() => {
    fetchMeasurements()
  }, 30000)

  return () => clearInterval(interval)
}, [])

  const fetchMeasurements = async () => {
    try {
      const response = await getMeasurements()
      setMeasurements(response.data.measurements)
    } catch (err) {
      setError(err.response?.data?.message || 'Neuspješno učitavanje mjerenja.')
    }
  }

  const resetForm = () => {
    setFormData({ value: '', blood_glucose_unit_id: 1, measured_on: today })
    setEditingId(null)
  }

  const handleSubmit = async () => {
    setError(null)
    setSuccess(null)
    try {
      if (editingId) {
        await updateMeasurement(editingId, formData)
        setSuccess('Mjerenje ažurirano uspješno.')
      } else {
        await storeMeasurement(formData)
        setSuccess('Mjerenje dodato uspješno.')
      }
      resetForm()
      fetchMeasurements()
    } catch (err) {
      if (err.response?.status === 422) {
        setError(Object.values(err.response.data.errors).flat().join(', '))
      } else {
        setError(err.response?.data?.error || '!')
      }
    }
  }

  const handleEdit = (measurement) => {
    setEditingId(measurement.id)
    setFormData({
      value: String(measurement.value),
      blood_glucose_unit_id: measurement.blood_glucose_unit_id,
      measured_on: measurement.measured_on?.split('T')[0] || '',
    })
  }

  const handleDelete = async (id) => {
    try {
      await deleteMeasurement(id)
      setSuccess('Mjerenje izbrisano.')
      fetchMeasurements()
    } catch (err) {
      setError(err.response?.data?.message || 'Neuspješno brisanje mjerenja.')
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Mjerenja</Text>

      {success && <Text style={styles.success}>{success}</Text>}
      {error && <Text style={styles.error}>{error}</Text>}

      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Vrijednost"
          placeholderTextColor="#999"
          value={formData.value}
          onChangeText={(text) => setFormData({ ...formData, value: text })}
          keyboardType="numeric"
        />

        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={formData.blood_glucose_unit_id}
            onValueChange={(value) => setFormData({ ...formData, blood_glucose_unit_id: value })}
            style={{ color: '#000' }}
            dropdownIconColor="#000"
          >
            <Picker.Item label="mg/dL" value={1} />
            <Picker.Item label="mmol/L" value={2} />
          </Picker>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Datum (YYYY-MM-DD)"
          placeholderTextColor="#999"
          value={formData.measured_on}
          onChangeText={(text) => setFormData({ ...formData, measured_on: text })}
        />

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>
            {editingId ? 'Azuriraj mjerenje' : 'Dodaj mjerenje'}
          </Text>
        </TouchableOpacity>

        {editingId && (
          <TouchableOpacity style={styles.cancelButton} onPress={resetForm}>
            <Text style={styles.buttonText}>Zatvori</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.subtitle}>Istorija</Text>

      {measurements.length === 0 ? (
        <Text style={styles.empty}>No measurements yet.</Text>
      ) : (
        measurements.map((m) => (
          <View key={m.id} style={styles.item}>
            <Text style={styles.itemText}>
              <Text style={styles.bold}>{m.value}</Text> {m.blood_glucose_unit?.symbol}
            </Text>
            <Text style={styles.itemText}>{formatDate(m.measured_on)}</Text>
            <View style={styles.row}>
              <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(m)}>
                <Text style={styles.buttonText}>Uredi</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(m.id)}>
                <Text style={styles.buttonText}>Izbriši</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5fafa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3f51b5',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3f51b5',
    marginTop: 20,
    marginBottom: 10,
  },
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
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
    marginBottom: 8,
  },
  cancelButton: {
    backgroundColor: '#9e9e9e',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#00acc1',
    padding: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: '#d32f2f',
    padding: 8,
    borderRadius: 6,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  item: {
    backgroundColor: 'white',
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
  },
  itemText: {
    fontSize: 14,
    marginBottom: 4,
    color: '#333',
  },
  bold: {
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    marginTop: 8,
  },
  empty: {
    color: '#999',
    textAlign: 'center',
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