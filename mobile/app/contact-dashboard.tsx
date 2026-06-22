import { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native'
import { LineChart, BarChart } from 'react-native-chart-kit'
import {
  getContactPatients,
  getContactDashboard,
} from '../src/api/contactDashboard'

const screenWidth = Dimensions.get('window').width - 32

export default function ContactDashboardScreen() {
  const [patients, setPatients] = useState<any[]>([])
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [glucoseData, setGlucoseData] = useState<any[]>([])
  const [therapyData, setTherapyData] = useState<any[]>([])
  const [loadingPatients, setLoadingPatients] = useState(true)
  const [loadingDashboard, setLoadingDashboard] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadPatients()
  }, [])

  useEffect(() => {
    if (selectedPatient) {
      loadDashboard(selectedPatient.patient_id)
    }
  }, [selectedPatient])

  const loadPatients = async () => {
    try {
      setLoadingPatients(true)
      const response = await getContactPatients()
      const data = response.data.patients || []

      setPatients(data)

      if (data.length > 0) {
        setSelectedPatient(data[0])
      }
    } catch {
      setError('Greška pri učitavanju pacijenata.')
    } finally {
      setLoadingPatients(false)
    }
  }

  const loadDashboard = async (patientId: number) => {
    try {
      setLoadingDashboard(true)
      const response = await getContactDashboard(patientId)

      setGlucoseData(response.data.blood_glucose || [])
      setTherapyData(response.data.therapy_logs || [])
    } catch {
      setError('Greška pri učitavanju dijagrama.')
    } finally {
      setLoadingDashboard(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('sr-RS', {
      day: '2-digit',
      month: '2-digit',
    })
  }

  const glucoseChartData = {
    labels: glucoseData.map((item) =>
      formatDate(item.created_at || item.measured_on)
    ),
    datasets: [
      {
        data: glucoseData.map((item) => Number(item.value)),
      },
    ],
  }

  const therapyChartData = {
    labels: therapyData.map((item) =>
      formatDate(item.created_at || item.taken_at)
    ),
    datasets: [
      {
        data: therapyData.map(() => 1),
      },
    ],
  }

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 1,
    color: () => '#3f51b5',
    labelColor: () => '#555',
    propsForDots: {
      r: '5',
    },
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Praćeni pacijenti</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.card}>
        <Text style={styles.subtitle}>Izaberi pacijenta</Text>

        {loadingPatients ? (
          <ActivityIndicator color="#3f51b5" />
        ) : patients.length === 0 ? (
          <Text>Nijeste povezani ni sa jednim pacijentom.</Text>
        ) : (
          patients.map((patient) => (
            <TouchableOpacity
              key={patient.patient_id}
              style={[
                styles.patientButton,
                selectedPatient?.patient_id === patient.patient_id &&
                  styles.activePatientButton,
              ]}
              onPress={() => setSelectedPatient(patient)}
            >
              <Text
                style={[
                  styles.patientText,
                  selectedPatient?.patient_id === patient.patient_id &&
                    styles.activePatientText,
                ]}
              >
                {patient.username} — {patient.relationship}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      {loadingDashboard ? (
        <ActivityIndicator color="#3f51b5" style={{ marginTop: 30 }} />
      ) : (
        <>
          <View style={styles.card}>
            <Text style={styles.subtitle}>Nivo glukoze u krvi</Text>

            {glucoseData.length === 0 ? (
              <Text>Nema mjerenja za izabranog pacijenta.</Text>
            ) : (
              <LineChart
                data={glucoseChartData}
                width={screenWidth}
                height={250}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
              />
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.subtitle}>Unesena terapija</Text>

            {therapyData.length === 0 ? (
              <Text>Nema zapisa o terapiji za izabranog pacijenta.</Text>
            ) : (
              <BarChart
                data={therapyChartData}
                width={screenWidth}
                height={250}
                yAxisLabel=""
                yAxisSuffix=""
                chartConfig={chartConfig}
                style={styles.chart}
              />
            )}
          </View>
        </>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e0f7fa',
    padding: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#3f51b5',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 18,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3f51b5',
    marginBottom: 12,
  },
  patientButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#b2ebf2',
    marginBottom: 8,
  },
  activePatientButton: {
    backgroundColor: '#3f51b5',
  },
  patientText: {
    color: '#3f51b5',
    fontWeight: 'bold',
  },
  activePatientText: {
    color: 'white',
  },
  chart: {
    borderRadius: 12,
  },
  error: {
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 12,
  },
})