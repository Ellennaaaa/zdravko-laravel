import { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native'
import { LineChart, BarChart } from 'react-native-chart-kit'
import { getWeeklyGlucose, getMonthlyGlucose, getWeeklyTherapy, getMonthlyTherapy } from '../src/api/dashboard'
import { getContactPatients, getContactDashboard } from '../src/api/contactDashboard'
import { Picker } from '@react-native-picker/picker'
import { getUser } from '../src/api/auth'

const screenWidth = Dimensions.get('window').width

// --- Glucose aggregation ---

// Today: each measurement becomes its own point with its actual time as label
const filterToday = (items: any[]) => {
  const today = new Date().toISOString().slice(0, 10)
  return items
    .filter((item) => item.measured_on?.slice(0, 10) === today)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .map((item) => ({
      label: item.created_at
        ? new Date(item.created_at).toLocaleTimeString('bs-BA', { hour: '2-digit', minute: '2-digit' })
        : '—',
      value: Number(item.value),
    }))
}

// Weekly: group by day, show short weekday name (Pon, Uto...), no date
const aggregateByDay = (items: any[]) => {
  const grouped: Record<string, number[]> = {}
  items.forEach((item) => {
    const date = item.measured_on ? item.measured_on.slice(0, 10) : null
    if (!date) return
    if (!grouped[date]) grouped[date] = []
    grouped[date].push(Number(item.value))
  })
  return Object.keys(grouped).sort().map((date) => {
    const values = grouped[date]
    const avg = values.reduce((a, b) => a + b, 0) / values.length
    const weekday = new Date(date).toLocaleDateString('bs-BA', { weekday: 'short' })
    // Capitalize first letter, strip trailing dot if present (e.g. "pon." → "Pon")
    const label = weekday.charAt(0).toUpperCase() + weekday.slice(1).replace(/\.$/, '')
    return { label, value: Math.round(avg * 10) / 10 }
  })
}

// Monthly: group by week, label as Sed 1, Sed 2...
const aggregateByWeek = (items: any[]) => {
  const grouped: Record<string, number[]> = {}
  items.forEach((item) => {
    const date = item.measured_on ? item.measured_on.slice(0, 10) : null
    if (!date) return
    const d = new Date(date)
    const weekStart = new Date(d)
    weekStart.setDate(d.getDate() - d.getDay() + 1)
    const weekKey = weekStart.toISOString().slice(0, 10)
    if (!grouped[weekKey]) grouped[weekKey] = []
    grouped[weekKey].push(Number(item.value))
  })
  return Object.keys(grouped).sort().map((weekKey, i) => {
    const values = grouped[weekKey]
    const avg = values.reduce((a, b) => a + b, 0) / values.length
    return { label: `Sed ${i + 1}`, value: Math.round(avg * 10) / 10 }
  })
}

// --- Therapy aggregation ---

// Today: each log as its own point with actual time
const filterTodayTherapy = (items: any[]) => {
  const today = new Date().toISOString().slice(0, 10)
  return items
    .filter((item) => item.taken_at?.slice(0, 10) === today)
    .sort((a, b) => new Date(a.taken_at).getTime() - new Date(b.taken_at).getTime())
    .map((item) => ({
      label: item.taken_at
        ? new Date(item.taken_at).toLocaleTimeString('bs-BA', { hour: '2-digit', minute: '2-digit' })
        : '—',
      count: 1,
    }))
}

// Weekly: group by day, show short weekday name, no date
const aggregateTherapyByDay = (items: any[]) => {
  const grouped: Record<string, number> = {}
  items.forEach((item) => {
    const date = item.taken_at ? item.taken_at.slice(0, 10) : null
    if (!date) return
    grouped[date] = (grouped[date] || 0) + 1
  })
  return Object.keys(grouped).sort().map((date) => {
    const weekday = new Date(date).toLocaleDateString('bs-BA', { weekday: 'short' })
    const label = weekday.charAt(0).toUpperCase() + weekday.slice(1).replace(/\.$/, '')
    return { label, count: grouped[date] }
  })
}

// Monthly: group by week
const aggregateTherapyByWeek = (items: any[]) => {
  const grouped: Record<string, number> = {}
  items.forEach((item) => {
    const date = item.taken_at ? item.taken_at.slice(0, 10) : null
    if (!date) return
    const d = new Date(date)
    const weekStart = new Date(d)
    weekStart.setDate(d.getDate() - d.getDay() + 1)
    const weekKey = weekStart.toISOString().slice(0, 10)
    grouped[weekKey] = (grouped[weekKey] || 0) + 1
  })
  return Object.keys(grouped).sort().map((weekKey, i) => ({
    label: `Sed ${i + 1}`,
    count: grouped[weekKey],
  }))
}

// Thin out labels when there are too many points (today view can have many)
const thinLabels = (labels: string[], maxVisible = 5) => {
  if (labels.length <= maxVisible) return labels
  const step = Math.ceil(labels.length / maxVisible)
  return labels.map((l, i) => (i % step === 0 ? l : ''))
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const roleNames = user?.roles?.map((role: any) => role.name) || []
  const isPatient = roleNames.includes('patient')
  const isContact = roleNames.includes('contact')

  const [period, setPeriod] = useState('today')
  const [glucoseData, setGlucoseData] = useState<any[]>([])
  const [therapyData, setTherapyData] = useState<any[]>([])
  const [contactPatients, setContactPatients] = useState([])
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [error, setError] = useState(null)
  const [tooltip, setTooltip] = useState<{ value: number; label: string } | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getUser()
        setUser(response.data.user)
      } catch (err) {
        console.log('Failed to fetch user', err)
      }
    }
    fetchUser()
  }, [])

  useEffect(() => {
    if (!user) return
    if (isPatient) loadPatientDashboard()
    else if (isContact) loadContactPatients()
  }, [user, period])

  const loadPatientDashboard = async () => {
    setError(null)
    try {
      if (period === 'today' || period === 'weekly') {
        const glucoseResponse = await getWeeklyGlucose()
        const therapyResponse = await getWeeklyTherapy()
        const rawGlucose = glucoseResponse.data.data || []
        const rawTherapy = therapyResponse.data.data || []

        if (period === 'today') {
          setGlucoseData(filterToday(rawGlucose))
          setTherapyData(filterTodayTherapy(rawTherapy))
        } else {
          setGlucoseData(aggregateByDay(rawGlucose))
          setTherapyData(aggregateTherapyByDay(rawTherapy))
        }
      } else {
        const glucoseResponse = await getMonthlyGlucose()
        const therapyResponse = await getMonthlyTherapy()
        const rawGlucose = glucoseResponse.data.data || []
        const rawTherapy = therapyResponse.data.data || []
        setGlucoseData(aggregateByWeek(rawGlucose))
        setTherapyData(aggregateTherapyByWeek(rawTherapy))
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard.')
    }
  }

  const loadContactPatients = async () => {
    setError(null)
    try {
      const response = await getContactPatients()
      const patients = response.data.patients || []
      setContactPatients(patients)
      if (patients.length > 0) setSelectedPatientId(patients[0].patient_id)
    } catch {
      setError('Failed to load patients.')
    }
  }

  const loadContactDashboard = async (patientId: any) => {
    setError(null)
    try {
      const response = await getContactDashboard(patientId)
      setGlucoseData(aggregateByDay(response.data.blood_glucose || []))
      setTherapyData(aggregateTherapyByDay(response.data.therapy_logs || []))
    } catch {
      setError('Failed to load contact dashboard.')
    }
  }

  // For today: use actual times, thinned if many; for weekly/monthly: use the day/week labels
  const glucoseLabels = glucoseData.map((item: any) => item.label || item.date || '')
  const visibleGlucoseLabels = period === 'today' ? thinLabels(glucoseLabels) : glucoseLabels

  const glucoseChartData = {
    labels: visibleGlucoseLabels.length > 0 ? visibleGlucoseLabels : [''],
    datasets: [{
      data: glucoseData.length > 0
        ? glucoseData.map((item: any) => item.value || 0)
        : [0],
    }],
  }

  const therapyLabels = therapyData.map((item: any) => item.label || '')
  const visibleTherapyLabels = period === 'today' ? thinLabels(therapyLabels) : therapyLabels

  const therapyChartData = {
    labels: visibleTherapyLabels.length > 0 ? visibleTherapyLabels : [''],
    datasets: [{
      data: therapyData.length > 0
        ? therapyData.map((item: any) => item.count || 0)
        : [0],
    }],
  }

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(63, 81, 181, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    propsForDots: { r: '4', strokeWidth: '2', stroke: '#3f51b5' },
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Dijagrami</Text>

      {error && <Text style={styles.error}>{error}</Text>}

      {isPatient && (
        <View style={styles.tabs}>
          {['today', 'weekly', 'monthly'].map((p) => (
            <TouchableOpacity
              key={p}
              style={period === p ? styles.activeTab : styles.tab}
              onPress={() => setPeriod(p)}
            >
              <Text style={period === p ? styles.activeTabText : styles.tabText}>
                {p === 'today' ? 'Danas' : p === 'weekly' ? 'Nedjelja' : 'Mjesec'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {isContact && !isPatient && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Izaberi pacijenta</Text>
          {contactPatients.length === 0 ? (
            <Text>Nijeste jos povezani ni sa jednim pacijentom</Text>
          ) : (
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedPatientId}
                onValueChange={(value) => {
                  setSelectedPatientId(value)
                  loadContactDashboard(value)
                }}
              >
                {contactPatients.map((p: any) => (
                  <Picker.Item key={p.patient_id} label={`${p.username} — ${p.relationship}`} value={p.patient_id} />
                ))}
              </Picker>
            </View>
          )}
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Nivo glukoze u krvi</Text>
        {tooltip && (
          <View style={styles.tooltip}>
            <Text style={styles.tooltipText}>{tooltip.label}: {tooltip.value} mmol/L</Text>
          </View>
        )}
        {glucoseData.length === 0 ? (
          <Text style={styles.empty}>Nema mjerenja za ovaj period</Text>
        ) : (
          <LineChart
            data={glucoseChartData}
            width={screenWidth - 64}
            height={200}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            onDataPointClick={({ value, index }) => {
              const label = glucoseData[index]?.label || glucoseData[index]?.date || ''
              setTooltip({ value, label })
              setTimeout(() => setTooltip(null), 3000)
            }}
          />
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Unesena terapija</Text>
        {therapyData.length === 0 ? (
          <Text style={styles.empty}>Nema zapisa o terapiji za ovaj period</Text>
        ) : (
          <BarChart
            data={therapyChartData}
            width={screenWidth - 64}
            height={200}
            chartConfig={chartConfig}
            style={styles.chart}
            yAxisLabel=""
            yAxisSuffix=""
          />
        )}
      </View>
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
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#3f51b5',
    borderRadius: 6,
  },
  activeTab: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#3f51b5',
    borderRadius: 6,
  },
  tabText: {
    color: '#3f51b5',
    fontSize: 13,
  },
  activeTabText: {
    color: 'white',
    fontSize: 13,
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
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#b2ebf2',
    borderRadius: 6,
  },
  chart: {
    borderRadius: 8,
  },
  empty: {
    color: '#999',
    textAlign: 'center',
    padding: 20,
  },
  error: {
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 10,
  },
  tooltip: {
    backgroundColor: '#3f51b5',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
    alignSelf: 'center',
  },
  tooltipText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 13,
  },
})
