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

  const formatDate = (dateString) => {
    if (!dateString) return 'No date'
    return dateString.slice(0, 10)
  }

  const prepareGlucoseData = (items = []) =>
    items.map((item) => ({
      date: formatDate(item.measured_on),
      value: Number(item.value),
      unit: item.blood_glucose_unit?.symbol,
    }))

  const prepareTherapyData = (items = []) => {
    const grouped = {}

    items.forEach((item) => {
      const date = formatDate(item.taken_at)
      grouped[date] = (grouped[date] || 0) + 1
    })

    return Object.keys(grouped).map((date) => ({
      date,
      count: grouped[date],
    }))
  }

  const loadPatientDashboard = async () => {
    setError(null)

    try {
      const glucoseResponse =
        period === 'weekly' ? await getWeeklyGlucose() : await getMonthlyGlucose()

      const therapyResponse =
        period === 'weekly' ? await getWeeklyTherapy() : await getMonthlyTherapy()

      setGlucoseData(prepareGlucoseData(glucoseResponse.data.data))
      setTherapyData(prepareTherapyData(therapyResponse.data.data))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard.')
    }
  }

  const loadContactPatients = async () => {
    setError(null)

    try {
      const response = await getContactPatients()
      const patients = response.data.patients || []

      setContactPatients(patients)

      if (patients.length > 0 && !selectedPatientId) {
        setSelectedPatientId(patients[0].patient_id)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load linked patients.')
    }
  }

  const loadContactDashboard = async (patientId) => {
    setError(null)

    try {
      const response = await getContactDashboard(patientId)

      setGlucoseData(prepareGlucoseData(response.data.blood_glucose))
      setTherapyData(prepareTherapyData(response.data.therapy_logs))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load contact dashboard.')
    }
  }

  if (!user) {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>Dijagrami</h1>
        <p>Ucitavanje korisnika</p>
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
            Weekly
          </button>

          <button
            onClick={() => setPeriod('monthly')}
            style={period === 'monthly' ? styles.activeButton : styles.button}
          >
            Monthly
          </button>
        </div>
      )}

      {isContact && !isPatient && (
        <section style={styles.card}>
          <h2>Izaberi pacijenta</h2>

          {contactPatients.length === 0 ? (
            <p>Nijeste jos povezani ni sa jednim pacijentom</p>
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

        {glucoseData.length === 0 ? (
          <p>Nema mjerenja nivoa glukoze za ovaj period</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={glucoseData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </section>

      <section style={styles.card}>
        <h2>Unesena terapija</h2>

        {therapyData.length === 0 ? (
          <p>Nema zapisa o uzimanju terapije za ovaj period</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={therapyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
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
}

export default Dashboard