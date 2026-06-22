import { useEffect, useState } from 'react'
import {
  getAdminStats,
  getAdminUsers,
  getAdminMeasurements,
  getAdminSmartGlucometers,
} from '../api/admin'

import {
  getAdminEducativeAdvices,
  storeAdminEducativeAdvice,
  deleteAdminEducativeAdvice,
} from '../api/adminEducativeAdvices'

function AdminPanel() {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [measurements, setMeasurements] = useState([])
  const [glucometers, setGlucometers] = useState([])
  const [activeTab, setActiveTab] = useState('users')
  const [error, setError] = useState(null)

  const [advices, setAdvices] = useState([])

  const [adviceData, setAdviceData] = useState({
    diabetes_type_id: '',
    min_age: '',
    max_age: '',
    title: '',
    content: '',
    is_active: true,
  })

  useEffect(() => {
    loadAdminData()
  }, [])

  const loadAdminData = async () => {
    try {
      const statsResponse = await getAdminStats()
      const usersResponse = await getAdminUsers()
      const measurementsResponse = await getAdminMeasurements()
      const glucometersResponse = await getAdminSmartGlucometers()

      const advicesResponse = await getAdminEducativeAdvices()
      setAdvices(advicesResponse.data.advices || [])

      setStats(statsResponse.data)
      setUsers(usersResponse.data.users || [])
      setMeasurements(measurementsResponse.data.measurements || [])
      setGlucometers(glucometersResponse.data.smart_glucometers || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load admin data.')
    }
  }

  const handleAdviceChange = (e) => {
  const { name, value, type, checked } = e.target

  setAdviceData({
    ...adviceData,
    [name]: type === 'checkbox' ? checked : value,
  })
}

const handleAdviceSubmit = async (e) => {
  e.preventDefault()
  setError(null)

  try {
    await storeAdminEducativeAdvice({
      ...adviceData,
      diabetes_type_id: adviceData.diabetes_type_id || null,
      min_age: adviceData.min_age || null,
      max_age: adviceData.max_age || null,
    })

    setAdviceData({
      diabetes_type_id: '',
      min_age: '',
      max_age: '',
      title: '',
      content: '',
      is_active: true,
    })

    loadAdminData()
  } catch (err) {
    setError(err.response?.data?.message || 'Failed to add advice.')
  }
}

const handleDeleteAdvice = async (id) => {
  try {
    await deleteAdminEducativeAdvice(id)
    loadAdminData()
  } catch {
    setError('Failed to delete advice.')
  }
}

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Admin Panel</h1>

      {error && <p style={styles.error}>{error}</p>}

      {stats && (
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>Korisnici: {stats.users_count}</div>
          <div style={styles.statCard}>Mjerenja: {stats.measurements_count}</div>
          <div style={styles.statCard}>Terapije: {stats.therapies_count}</div>
          <div style={styles.statCard}>Pametni glukometri: {stats.smart_glucometers_count}</div>
          <div style={styles.statCard}>Hitni kontakti: {stats.emergency_contacts_count}</div>
        </div>
      )}

      <div style={styles.tabs}>
        <button onClick={() => setActiveTab('users')} style={activeTab === 'users' ? styles.activeButton : styles.button}>
          Korisnici
        </button>
        <button onClick={() => setActiveTab('measurements')} style={activeTab === 'measurements' ? styles.activeButton : styles.button}>
          Mjerenja
        </button>
        <button onClick={() => setActiveTab('glucometers')} style={activeTab === 'glucometers' ? styles.activeButton : styles.button}>
          Pametni glukometri
        </button>
        <button
          onClick={() => setActiveTab('advices')}
          style={activeTab === 'advices' ? styles.activeButton : styles.button}
        >
          Educative Advices
        </button>
      </div>

      {activeTab === 'users' && (
        <section style={styles.card}>
          <h2>Korisnici</h2>

          <table style={styles.table}>
            <thead>
              <tr>
                <th>Korisničko ime</th>
                <th>Mail</th>
                <th>Broj telefona</th>
                <th>Uloga</th>
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
          <h2>Mjerenja</h2>

          <table style={styles.table}>
            <thead>
              <tr>
                <th>Pacijent</th>
                <th>Vrijednost</th>
                <th>Jedinica</th>
                <th>Datum</th>
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
          <h2>Pametni glukometar</h2>

          <table style={styles.table}>
            <thead>
              <tr>
                <th>Pacijent</th>
                <th>Uredjaj</th>
                <th>Serijski broj</th>
                <th>Aktivan</th>
                <th>Posljednja simulacija</th>
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

      {activeTab === 'advices' && (
      <section style={styles.card}>
        <h2>Edukativni savjeti</h2>

        <form onSubmit={handleAdviceSubmit} style={styles.form}>
          <select
            name="diabetes_type_id"
            value={adviceData.diabetes_type_id}
            onChange={handleAdviceChange}
            style={styles.input}
          >
            <option value="">Svi tipovi dijabetesa</option>
            <option value="1">Tip 1</option>
            <option value="2">Tip 2</option>
          </select>

          <input
            name="min_age"
            type="number"
            placeholder="Donja granica godina"
            value={adviceData.min_age}
            onChange={handleAdviceChange}
            style={styles.input}
          />

          <input
            name="max_age"
            type="number"
            placeholder="Gornja granica godina"
            value={adviceData.max_age}
            onChange={handleAdviceChange}
            style={styles.input}
          />

          <input
            name="title"
            placeholder="Naslov savjeta"
            value={adviceData.title}
            onChange={handleAdviceChange}
            style={styles.input}
          />

          <textarea
            name="content"
            placeholder="Sadržaj savjeta"
            value={adviceData.content}
            onChange={handleAdviceChange}
            style={styles.textarea}
          />

          <label>
            <input
              name="is_active"
              type="checkbox"
              checked={adviceData.is_active}
              onChange={handleAdviceChange}
            />
            Aktivan
          </label>

          <button type="submit" style={styles.button}>
            Dodaj savjet
          </button>
        </form>

        <hr />

        {advices.length === 0 ? (
          <p>No educative advices yet.</p>
        ) : (
          advices.map((advice) => (
            <div key={advice.id} style={styles.item}>
              <h3>{advice.title}</h3>
              <p>{advice.content}</p>
              <p>
                Diabetes type:{' '}
                {advice.diabetes_type_id ? advice.diabetes_type_id : 'All'}
              </p>
              <p>
                Age:{' '}
                {advice.min_age ?? 'any'} - {advice.max_age ?? 'any'}
              </p>
              <p>Status: {advice.is_active ? 'Active' : 'Inactive'}</p>

              <button
                onClick={() => handleDeleteAdvice(advice.id)}
                style={styles.deleteButton}
              >
                Delete
              </button>
            </div>
          ))
        )}
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

  form: {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  marginBottom: '20px',
},

input: {
  padding: '10px',
  borderRadius: '6px',
  border: '1px solid #b2ebf2',
},

textarea: {
  padding: '10px',
  borderRadius: '6px',
  border: '1px solid #b2ebf2',
  minHeight: '80px',
},

item: {
  borderBottom: '1px solid #e0f7fa',
  padding: '12px 0',
},

deleteButton: {
  padding: '7px 10px',
  border: 'none',
  borderRadius: '6px',
  backgroundColor: '#d32f2f',
  color: 'white',
  cursor: 'pointer',
},
}

export default AdminPanel