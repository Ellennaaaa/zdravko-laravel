import { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'

import {
  getContactPatients,
  getContactDashboard,
} from '../api/contactDashboard'

function ContactDashboard() {
  const [patients, setPatients] = useState([])
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [glucoseData, setGlucoseData] = useState([])
  const [therapyData, setTherapyData] = useState([])
  const [loadingPatients, setLoadingPatients] = useState(true)
  const [loadingDashboard, setLoadingDashboard] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadPatients()
  }, [])

  useEffect(() => {
    if (selectedPatientId) {
      loadDashboard(selectedPatientId)
    }
  }, [selectedPatientId])

  const formatDateTime = (dateString) => {
    if (!dateString) return 'No date'

    return new Date(dateString).toLocaleString('sr-RS', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDateOnly = (dateString) => {
    if (!dateString) return 'No date'

    return new Date(dateString).toLocaleDateString('sr-RS')
  }

  const prepareGlucoseData = (items = []) =>
    items.map((item) => {
      const dateSource = item.created_at || item.measured_on

      return {
        date: formatDateOnly(dateSource),
        dateTime: formatDateTime(dateSource),
        value: Number(item.value),
        unit: item.blood_glucose_unit?.symbol,
      }
    })

  const prepareTherapyData = (items = []) =>
    items.map((item) => {
      const dateSource = item.created_at || item.taken_at

      return {
        date: formatDateOnly(dateSource),
        dateTime: formatDateTime(dateSource),
        count: 1,
        medicine: item.medicine?.name,
      }
    })

  const loadPatients = async () => {
    setLoadingPatients(true)
    setError(null)

    try {
      const response = await getContactPatients()
      const linkedPatients = response.data.patients || []

      setPatients(linkedPatients)

      if (linkedPatients.length > 0) {
        setSelectedPatientId(linkedPatients[0].patient_id)
      }
    } catch {
      setError('Failed to load patients.')
    } finally {
      setLoadingPatients(false)
    }
  }

  const loadDashboard = async (patientId) => {
    setLoadingDashboard(true)
    setError(null)

    try {
      const response = await getContactDashboard(patientId)

      setGlucoseData(prepareGlucoseData(response.data.blood_glucose || []))
      setTherapyData(prepareTherapyData(response.data.therapy_logs || []))
    } catch {
      setError('Failed to load contact dashboard.')
    } finally {
      setLoadingDashboard(false)
    }
  }

  const glucoseTooltip = ({ active, payload }) => {
    if (!active || !payload || payload.length === 0) return null

    const item = payload[0].payload

    return (
      <div style={styles.tooltip}>
        <p><strong>{item.dateTime}</strong></p>
        <p>Vrijednost: {item.value} {item.unit}</p>
      </div>
    )
  }

  const therapyTooltip = ({ active, payload }) => {
    if (!active || !payload || payload.length === 0) return null

    const item = payload[0].payload

    return (
      <div style={styles.tooltip}>
        <p><strong>{item.dateTime}</strong></p>
        <p>Terapija: {item.medicine || '—'}</p>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Contact Dashboard</h1>

      {error && <p style={styles.error}>{error}</p>}

      <section style={styles.card}>
        <h2>Izaberi pacijenta</h2>

        {loadingPatients ? (
          <p style={styles.loader}>Učitavanje pacijenata...</p>
        ) : patients.length === 0 ? (
          <p>Nijeste povezani ni sa jednim pacijentom.</p>
        ) : (
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            style={styles.input}
          >
            {patients.map((patient) => (
              <option key={patient.patient_id} value={patient.patient_id}>
                {patient.username} — {patient.relationship}
              </option>
            ))}
          </select>
        )}
      </section>

      <section style={styles.card}>
        <h2>Nivo glukoze u krvi</h2>

        {loadingDashboard ? (
          <p style={styles.loader}>Učitavanje dijagrama...</p>
        ) : glucoseData.length === 0 ? (
          <p>Nema mjerenja za izabranog pacijenta.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={glucoseData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip content={glucoseTooltip} />
              <Line type="monotone" dataKey="value" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </section>

      <section style={styles.card}>
        <h2>Unesena terapija</h2>

        {loadingDashboard ? (
          <p style={styles.loader}>Učitavanje terapije...</p>
        ) : therapyData.length === 0 ? (
          <p>Nema zapisa o terapiji za izabranog pacijenta.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={therapyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip content={therapyTooltip} />
              <Bar dataKey="count" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </section>
    </div>
  )
}

const styles = {
  container: {
    maxWidth: '1000px',
    margin: '30px auto',
    padding: '20px',
  },
  title: {
    textAlign: 'center',
    color: '#3f51b5',
  },
  card: {
    backgroundColor: 'white',
    padding: '20px',
    marginBottom: '25px',
    borderRadius: '10px',
    boxShadow: '0 4px 15px rgba(0,150,150,0.12)',
  },
  input: {
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #b2ebf2',
    width: '100%',
    maxWidth: '400px',
  },
  loader: {
    color: '#3f51b5',
    fontWeight: 'bold',
  },
  error: {
    color: '#d32f2f',
  },
  tooltip: {
    backgroundColor: 'white',
    border: '1px solid #b2ebf2',
    borderRadius: '8px',
    padding: '10px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
  },
}

export default ContactDashboard