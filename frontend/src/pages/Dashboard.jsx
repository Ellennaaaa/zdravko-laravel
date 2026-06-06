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
  getWeeklyGlucose,
  getMonthlyGlucose,
  getWeeklyTherapy,
  getMonthlyTherapy,
} from '../api/dashboard'

import {
  getContactPatients,
  getContactDashboard,
} from '../api/contactDashboard'

function Dashboard({ user }) {
  const roleNames = user?.roles?.map((role) => role.name) || []
  const isPatient = roleNames.includes('patient')
  const isContact = roleNames.includes('contact')

  const [period, setPeriod] = useState('weekly')
  const [glucoseData, setGlucoseData] = useState([])
  const [therapyData, setTherapyData] = useState([])
  const [contactPatients, setContactPatients] = useState([])
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [error, setError] = useState(null)
  const [loadingDashboard, setLoadingDashboard] = useState(false)
  const [loadingPatients, setLoadingPatients] = useState(false)

  useEffect(() => {
    if (!user) return

    if (isPatient) {
      loadPatientDashboard()
    } else if (isContact) {
      loadContactPatients()
    }
  }, [user, isPatient, isContact, period])

  useEffect(() => {
    if (isContact && !isPatient && selectedPatientId) {
      loadContactDashboard(selectedPatientId)
    }
  }, [selectedPatientId, isContact, isPatient])

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

    return new Date(dateString).toLocaleDateString('sr-RS', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const prepareGlucoseData = (items = []) => {
    return items.map((item) => {
      const dateSource = item.created_at || item.measured_on

      return {
        date: formatDateOnly(dateSource),
        dateTime: formatDateTime(dateSource),
        value: Number(item.value),
        unit: item.blood_glucose_unit?.symbol,
      }
    })
  }

  const prepareTherapyData = (items = []) => {
    return items.map((item) => {
      const dateSource = item.created_at || item.taken_at

      return {
        date: formatDateOnly(dateSource),
        dateTime: formatDateTime(dateSource),
        count: 1,
        medicine: item.medicine?.name,
      }
    })
  }

  const loadPatientDashboard = async () => {
    setError(null)
    setLoadingDashboard(true)

    try {
      const glucoseResponse =
        period === 'weekly'
          ? await getWeeklyGlucose()
          : await getMonthlyGlucose()

      const therapyResponse =
        period === 'weekly'
          ? await getWeeklyTherapy()
          : await getMonthlyTherapy()

      setGlucoseData(prepareGlucoseData(glucoseResponse.data.data || []))
      setTherapyData(prepareTherapyData(therapyResponse.data.data || []))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard.')
    } finally {
      setLoadingDashboard(false)
    }
  }

  const loadContactPatients = async () => {
    setError(null)
    setLoadingPatients(true)

    try {
      const response = await getContactPatients()
      const patients = response.data.patients || []

      setContactPatients(patients)

      if (patients.length > 0 && !selectedPatientId) {
        setSelectedPatientId(patients[0].patient_id)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load linked patients.')
    } finally {
      setLoadingPatients(false)
    }
  }

  const loadContactDashboard = async (patientId) => {
    setError(null)
    setLoadingDashboard(true)

    try {
      const response = await getContactDashboard(patientId)

      setGlucoseData(prepareGlucoseData(response.data.blood_glucose || []))
      setTherapyData(prepareTherapyData(response.data.therapy_logs || []))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load contact dashboard.')
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
        <p>
          Vrijednost: {item.value} {item.unit || ''}
        </p>
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
        <p>Broj zapisa: {item.count}</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>Dijagrami</h1>
        <p style={styles.loader}>Učitavanje korisnika...</p>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Dijagrami</h1>

      {isPatient && (
        <div style={styles.tabs}>
          <button
            onClick={() => setPeriod('weekly')}
            style={period === 'weekly' ? styles.activeButton : styles.button}
          >
            Sedmično
          </button>

          <button
            onClick={() => setPeriod('monthly')}
            style={period === 'monthly' ? styles.activeButton : styles.button}
          >
            Mjesečno
          </button>
        </div>
      )}

      {isContact && !isPatient && (
        <section style={styles.card}>
          <h2>Izaberite pacijenta</h2>

          {loadingPatients ? (
            <p style={styles.loader}>Učitavanje pacijenata...</p>
          ) : contactPatients.length === 0 ? (
            <p>Nijeste još povezani ni sa jednim pacijentom.</p>
          ) : (
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              style={styles.input}
            >
              {contactPatients.map((patient) => (
                <option key={patient.patient_id} value={patient.patient_id}>
                  {patient.username} — {patient.relationship}
                </option>
              ))}
            </select>
          )}
        </section>
      )}

      {error && <p style={styles.error}>{error}</p>}

      <section style={styles.card}>
        <h2>Nivo glukoze u krvi</h2>

        {loadingDashboard ? (
          <p style={styles.loader}>Učitavanje dijagrama glukoze...</p>
        ) : glucoseData.length === 0 ? (
          <p>Nema mjerenja nivoa glukoze za ovaj period.</p>
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
          <p style={styles.loader}>Učitavanje dijagrama terapije...</p>
        ) : therapyData.length === 0 ? (
          <p>Nema zapisa o uzimanju terapije za ovaj period.</p>
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
  tabs: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '25px',
  },
  button: {
    padding: '10px 20px',
    border: '1px solid #3f51b5',
    borderRadius: '6px',
    backgroundColor: 'white',
    color: '#3f51b5',
    cursor: 'pointer',
  },
  activeButton: {
    padding: '10px 20px',
    border: '1px solid #3f51b5',
    borderRadius: '6px',
    backgroundColor: '#3f51b5',
    color: 'white',
    cursor: 'pointer',
  },
  card: {
    backgroundColor: 'white',
    padding: '20px',
    marginBottom: '25px',
    borderRadius: '10px',
    boxShadow: '0 4px 15px rgba(0, 150, 150, 0.12)',
  },
  input: {
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #b2ebf2',
    width: '100%',
    maxWidth: '400px',
  },
  error: {
    color: '#d32f2f',
    textAlign: 'center',
  },
  loader: {
    color: '#3f51b5',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tooltip: {
    backgroundColor: 'white',
    border: '1px solid #b2ebf2',
    borderRadius: '8px',
    padding: '10px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
  },
}

export default Dashboard