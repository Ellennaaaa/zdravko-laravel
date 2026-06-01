import { useEffect, useState } from 'react'
import {
  getAdminStats,
  getAdminUsers,
  getAdminMeasurements,
  getAdminSmartGlucometers,
} from '../api/admin'

function AdminPanel() {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [measurements, setMeasurements] = useState([])
  const [glucometers, setGlucometers] = useState([])
  const [activeTab, setActiveTab] = useState('users')
  const [error, setError] = useState(null)

  useEffect(() => {
    loadAdminData()
  }, [])

  const loadAdminData = async () => {
    try {
      const statsResponse = await getAdminStats()
      const usersResponse = await getAdminUsers()
      const measurementsResponse = await getAdminMeasurements()
      const glucometersResponse = await getAdminSmartGlucometers()

      setStats(statsResponse.data)
      setUsers(usersResponse.data.users || [])
      setMeasurements(measurementsResponse.data.measurements || [])
      setGlucometers(glucometersResponse.data.smart_glucometers || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load admin data.')
    }
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Admin Panel</h1>

      {error && <p style={styles.error}>{error}</p>}

      {stats && (
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>Users: {stats.users_count}</div>
          <div style={styles.statCard}>Measurements: {stats.measurements_count}</div>
          <div style={styles.statCard}>Therapies: {stats.therapies_count}</div>
          <div style={styles.statCard}>Smart Glucometers: {stats.smart_glucometers_count}</div>
          <div style={styles.statCard}>Emergency Contacts: {stats.emergency_contacts_count}</div>
        </div>
      )}

      <div style={styles.tabs}>
        <button onClick={() => setActiveTab('users')} style={activeTab === 'users' ? styles.activeButton : styles.button}>
          Users
        </button>
        <button onClick={() => setActiveTab('measurements')} style={activeTab === 'measurements' ? styles.activeButton : styles.button}>
          Measurements
        </button>
        <button onClick={() => setActiveTab('glucometers')} style={activeTab === 'glucometers' ? styles.activeButton : styles.button}>
          Smart Glucometers
        </button>
      </div>

      {activeTab === 'users' && (
        <section style={styles.card}>
          <h2>Users</h2>

          <table style={styles.table}>
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Roles</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.phone_number}</td>
                  <td>{user.roles?.map((role) => role.name).join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {activeTab === 'measurements' && (
        <section style={styles.card}>
          <h2>Measurements</h2>

          <table style={styles.table}>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Value</th>
                <th>Unit</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {measurements.map((m) => (
                <tr key={m.id}>
                  <td>{m.patient?.user?.username || '—'}</td>
                  <td>{m.value}</td>
                  <td>{m.blood_glucose_unit?.symbol}</td>
                  <td>{m.measured_on || m.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {activeTab === 'glucometers' && (
        <section style={styles.card}>
          <h2>Smart Glucometers</h2>

          <table style={styles.table}>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Device</th>
                <th>Serial</th>
                <th>Active</th>
                <th>Last Simulated</th>
              </tr>
            </thead>
            <tbody>
              {glucometers.map((g) => (
                <tr key={g.id}>
                  <td>{g.patient?.user?.username || '—'}</td>
                  <td>{g.device_name}</td>
                  <td>{g.device_serial || '—'}</td>
                  <td>{g.is_active ? 'Yes' : 'No'}</td>
                  <td>{g.last_simulated_at || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  )
}

const styles = {
  container: {
    maxWidth: '1100px',
    margin: '30px auto',
    padding: '20px',
  },
  title: {
    color: '#3f51b5',
    textAlign: 'center',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '15px',
    marginBottom: '25px',
  },
  statCard: {
    backgroundColor: 'white',
    padding: '18px',
    borderRadius: '10px',
    boxShadow: '0 4px 15px rgba(0,150,150,0.12)',
    fontWeight: 'bold',
    color: '#3f51b5',
  },
  tabs: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  },
  button: {
    padding: '10px 15px',
    border: '1px solid #3f51b5',
    borderRadius: '6px',
    backgroundColor: 'white',
    color: '#3f51b5',
    cursor: 'pointer',
  },
  activeButton: {
    padding: '10px 15px',
    border: '1px solid #3f51b5',
    borderRadius: '6px',
    backgroundColor: '#3f51b5',
    color: 'white',
    cursor: 'pointer',
  },
  card: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 4px 15px rgba(0,150,150,0.12)',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  error: {
    color: '#d32f2f',
  },
}

export default AdminPanel