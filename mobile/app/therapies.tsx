import { useEffect, useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { Picker } from '@react-native-picker/picker'
import {
  getTherapies,
  storeTherapy,
  deleteTherapy,
  getTherapyLogs,
  storeTherapyLog,
  deleteTherapyLog,
} from '../src/api/therapies'
import { formatDate, formatDateTime } from '../src/utils/dateUtils'

export default function Therapies() {
  const [therapies, setTherapies] = useState([])
  const [therapyLogs, setTherapyLogs] = useState([])
  const today = new Date().toISOString().split('T')[0]
  const nowTime = new Date().toTimeString().slice(0, 5)

  const [therapyData, setTherapyData] = useState({
    medicine_id: 1,
    dosage: '',
    unit_id: 1,
    times_per_day: '1',
    start_time: nowTime,
    start_date: today,
    end_date: '',
    note: '',
  })
  const now = new Date().toISOString().slice(0, 16)

  const [logData, setLogData] = useState({
    therapy_id: '',
    medicine_id: 1,
    dosage: '',
    unit_id: 1,
    taken_at: now,
    note: '',
  })
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [activeTab, setActiveTab] = useState('plans')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const therapiesResponse = await getTherapies()
      const logsResponse = await getTherapyLogs()
      setTherapies(therapiesResponse.data.therapies)
      setTherapyLogs(logsResponse.data.therapy_logs)
    } catch {
      setError('Neuspješno učitavanje podataka o terapiji.')
    }
  }

  const handleError = (err: any) => {
    if (err.response?.status === 422) {
      setError(Object.values(err.response.data.errors).flat().join(', '))
    } else {
      setError(err.response?.data?.error || '!')
    }
  }

  const handleTherapySubmit = async () => {
    setError(null)
    setSuccess(null)
    try {
      await storeTherapy(therapyData)
      setSuccess('Plan terapije dodat uspješno.')
        setTherapyData({
      medicine_id: 1,
      dosage: '',
      unit_id: 1,
      times_per_day: '1',
      start_time: nowTime,
      start_date: today,
      end_date: '',
      note: '',
    })
      loadData()
    } catch (err) {
      handleError(err)
    }
  }

  const handleLogSubmit = async () => {
    setError(null)
    setSuccess(null)
    try {
      await storeTherapyLog(logData)
      setSuccess('Zapis terapije dodat uspješno.')
      setLogData({
        therapy_id: '',
        medicine_id: 1,
        dosage: '',
        unit_id: 1,
        taken_at: now,
        note: '',
      })
      loadData()
    } catch (err) {
      handleError(err)
    }
  }

  const handleDeleteTherapy = async (id: number) => {
    try {
      await deleteTherapy(id)
      setSuccess('Terapija izbrisana.')
      loadData()
    } catch {
      setError('Neuspješno brisanje terapije.')
    }
  }

  const handleDeleteLog = async (id: number) => {
    try {
      await deleteTherapyLog(id)
      setSuccess('Unijet zapis terapije.')
      loadData()
    } catch {
      setError('Neuspješno dodavanje zapisa terapije.')
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Terapije</Text>

      {success && <Text style={styles.success}>{success}</Text>}
      {error && <Text style={styles.error}>{error}</Text>}

      <View style={styles.tabs}>
        <TouchableOpacity
          style={activeTab === 'plans' ? styles.activeTab : styles.tab}
          onPress={() => setActiveTab('plans')}
        >
          <Text style={activeTab === 'plans' ? styles.activeTabText : styles.tabText}>Planovi</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={activeTab === 'add_plan' ? styles.activeTab : styles.tab}
          onPress={() => setActiveTab('add_plan')}
        >
          <Text style={activeTab === 'add_plan' ? styles.activeTabText : styles.tabText}>Dodaj plan</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={activeTab === 'logs' ? styles.activeTab : styles.tab}
          onPress={() => setActiveTab('logs')}
        >
          <Text style={activeTab === 'logs' ? styles.activeTabText : styles.tabText}>Zapisi</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={activeTab === 'add_log' ? styles.activeTab : styles.tab}
          onPress={() => setActiveTab('add_log')}
        >
          <Text style={activeTab === 'add_log' ? styles.activeTabText : styles.tabText}>Dodaj zapis</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'add_plan' && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Dodaj plan terapije</Text>

          <Text style={styles.label}>Lijek</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={therapyData.medicine_id}
              onValueChange={(value) => setTherapyData({ ...therapyData, medicine_id: value })}
              style={{ color: '#000' }}
              dropdownIconColor="#000"
            >
              <Picker.Item label="Insulin" value={1} />
              <Picker.Item label="Metformin" value={2} />
            </Picker>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Doza"
            placeholderTextColor="#999"
            value={therapyData.dosage}
            onChangeText={(text) => setTherapyData({ ...therapyData, dosage: text })}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Jedinica</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={therapyData.unit_id}
              onValueChange={(value) => setTherapyData({ ...therapyData, unit_id: value })}
              style={{ color: '#000' }}
              dropdownIconColor="#000"
            >
              <Picker.Item label="mg" value={1} />
              <Picker.Item label="ml" value={2} />
              <Picker.Item label="tableta" value={3} />
              <Picker.Item label="IU" value={4} />
            </Picker>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Puta dnevno"
            placeholderTextColor="#999"
            value={therapyData.times_per_day}
            onChangeText={(text) => setTherapyData({ ...therapyData, times_per_day: text })}
            keyboardType="numeric"
          />

          <TextInput
            style={styles.input}
            placeholder="Vrijeme pocetka (HH:MM)"
            placeholderTextColor="#999"
            value={therapyData.start_time}
            onChangeText={(text) => setTherapyData({ ...therapyData, start_time: text })}
          />

          <TextInput
            style={styles.input}
            placeholder="Datum pocetka (YYYY-MM-DD)"
            value={therapyData.start_date}
            onChangeText={(text) => setTherapyData({ ...therapyData, start_date: text })}
          />

          <TextInput
            style={styles.input}
            placeholder="Datum kraja (YYYY-MM-DD)"
            placeholderTextColor="#999"
            value={therapyData.end_date}
            onChangeText={(text) => setTherapyData({ ...therapyData, end_date: text })}
          />

          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Bilješka"
            placeholderTextColor="#999"
            value={therapyData.note}
            onChangeText={(text) => setTherapyData({ ...therapyData, note: text })}
            multiline
          />

          <TouchableOpacity style={styles.button} onPress={handleTherapySubmit}>
            <Text style={styles.buttonText}>Dodaj terapiju</Text>
          </TouchableOpacity>
        </View>
      )}

      {activeTab === 'plans' && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Moji planovi terapije</Text>
          {therapies.length === 0 ? (
            <Text style={styles.empty}>Nema dodatih planova.</Text>
          ) : (
            therapies.map((therapy: any) => (
              <View key={therapy.id} style={styles.item}>
                <Text style={styles.itemTitle}>
                  {therapy.medicine?.name} — {therapy.dosage} {therapy.unit?.symbol}, {therapy.times_per_day}x/day
                </Text>
                <Text style={styles.itemText}>
                  Od {formatDate(therapy.start_date)} do {therapy.end_date ? formatDate(therapy.end_date) : 'ongoing'}
                </Text>
                {therapy.note ? <Text style={styles.itemText}>{therapy.note}</Text> : null}
                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteTherapy(therapy.id)}>
                  <Text style={styles.buttonText}>Ukloni</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      )}

      {activeTab === 'add_log' && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Dodaj uzetu terapiju</Text>

          <Text style={styles.label}>Linked therapy plan</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={logData.therapy_id}
              onValueChange={(value) => setLogData({ ...logData, therapy_id: value })}
              style={{ color: '#000' }}
              dropdownIconColor="#000"
            >
              <Picker.Item label="Nema unijetog plana terapije" value="" />
              {therapies.map((therapy: any) => (
                <Picker.Item
                  key={therapy.id}
                  label={`${therapy.medicine?.name} — ${therapy.dosage} ${therapy.unit?.symbol}`}
                  value={therapy.id}
                />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Lijek</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={logData.medicine_id}
              onValueChange={(value) => setLogData({ ...logData, medicine_id: value })}
              style={{ color: '#000' }}
              dropdownIconColor="#000"
            >
              <Picker.Item label="Insulin" value={1} />
              <Picker.Item label="Metformin" value={2} />
            </Picker>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Uzeta doza"
            placeholderTextColor="#999"
            value={logData.dosage}
            onChangeText={(text) => setLogData({ ...logData, dosage: text })}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Jedinica</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={logData.unit_id}
              onValueChange={(value) => setLogData({ ...logData, unit_id: value })}
              style={{ color: '#000' }}
              dropdownIconColor="#000"
            >
              <Picker.Item label="mg" value={1} />
              <Picker.Item label="ml" value={2} />
              <Picker.Item label="tableta" value={3} />
              <Picker.Item label="IU" value={4} />
            </Picker>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Uzeto u (YYYY-MM-DD HH:MM)"
            placeholderTextColor="#999"
            value={logData.taken_at}
            onChangeText={(text) => setLogData({ ...logData, taken_at: text })}
          />

          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Bilješka"
            placeholderTextColor="#999"
            value={logData.note}
            onChangeText={(text) => setLogData({ ...logData, note: text })}
            multiline
          />

          <TouchableOpacity style={styles.button} onPress={handleLogSubmit}>
            <Text style={styles.buttonText}>Sacuvaj zapis</Text>
          </TouchableOpacity>
        </View>
      )}

      {activeTab === 'logs' && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Zapisi o terapiji</Text>
          {therapyLogs.length === 0 ? (
            <Text style={styles.empty}>No therapy logs yet.</Text>
          ) : (
            therapyLogs.map((log: any) => (
              <View key={log.id} style={styles.item}>
                <Text style={styles.itemTitle}>
                  {log.medicine?.name} — {log.dosage} {log.unit?.symbol}
                </Text>
                <Text style={styles.itemText}>Uzeto: {formatDateTime(log.taken_at)}</Text>                
                {log.note ? (
                  <Text style={styles.itemText}>
                    {log.note}
                  </Text>
                ) : null}
                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteLog(log.id)}>
                  <Text style={styles.buttonText}>Ukloni</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
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
  tabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#3f51b5',
  },
  activeTab: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#3f51b5',
  },
  tabText: {
    color: '#3f51b5',
    fontWeight: 'bold',
    fontSize: 12,
  },
  activeTabText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    color: '#555',
    marginBottom: 4,
  },
  input: {
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#b2ebf2',
    fontSize: 14,
    marginBottom: 10,
  },
  textarea: {
    minHeight: 70,
    textAlignVertical: 'top',
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
  },
  deleteButton: {
    backgroundColor: '#d32f2f',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  item: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0f7fa',
    paddingVertical: 12,
  },
  itemTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  itemText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  empty: {
    color: '#999',
    textAlign: 'center',
    padding: 20,
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