import { useEffect, useState } from 'react'
import {
  getSmartGlucometers,
  storeSmartGlucometer,
  deleteSmartGlucometer,
} from '../api/smartGlucometers'

function SmartGlucometers() {
  const [glucometers, setGlucometers] = useState([])

  const [formData, setFormData] = useState({
    device_name: '',
    device_serial: '',
    is_active: true,
  })

  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    loadGlucometers()
  }, [])

  const loadGlucometers = async () => {
    try {
      const response = await getSmartGlucometers()
      setGlucometers(response.data.smart_glucometers || [])
    } catch {
      setError('Failed to load smart glucometers.')
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    try {
      await storeSmartGlucometer(formData)

      setSuccess('Smart glucometer added successfully.')

      setFormData({
        device_name: '',
        device_serial: '',
        is_active: true,
      })

      loadGlucometers()
    } catch (err) {
      if (err.response?.status === 422) {
        const errors = err.response.data.errors
        setError(Object.values(errors).flat().join(', '))
      } else {
        setError(err.response?.data?.error || 'Something went wrong.')
      }
    }
  }

  const handleDelete = async (id) => {
    setError(null)
    setSuccess(null)

    try {
      await deleteSmartGlucometer(id)
      setSuccess('Smart glucometer removed.')
      loadGlucometers()
    } catch {
      setError('Failed to delete smart glucometer.')
    }
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Smart Glucometers</h1>

      {success && <p style={styles.success}>{success}</p>}
      {error && <p style={styles.error}>{error}</p>}

      <section style={styles.card}>
        <h2>Add Smart Glucometer</h2>
        <p style={styles.text}>
          Add a simulated Bluetooth glucometer. Active devices will automatically
          generate glucose readings through the scheduler.
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            name="device_name"
            placeholder="Device name, e.g. AccuCheck Smart"
            value={formData.device_name}
            onChange={handleChange}
            style={styles.input}
          />

          <input
            name="device_serial"
            placeholder="Serial number optional"
            value={formData.device_serial}
            onChange={handleChange}
            style={styles.input}
          />

          <label style={styles.checkboxLabel}>
            <input
              name="is_active"
              type="checkbox"
              checked={formData.is_active}
              onChange={handleChange}
            />
            Active device
          </label>

          <button type="submit" style={styles.button}>
            Add Glucometer
          </button>
        </form>
      </section>

      <section style={styles.card}>
        <h2>My Devices</h2>

        {glucometers.length === 0 ? (
          <p>No smart glucometers added yet.</p>
        ) : (
          glucometers.map((device) => (
            <div key={device.id} style={styles.item}>
              <p>
                <strong>{device.device_name}</strong>
              </p>
              <p>Serial: {device.device_serial || '—'}</p>
              <p>Status: {device.is_active ? 'Active' : 'Inactive'}</p>
              <p>
                Last simulated reading:{' '}
                {device.last_simulated_at || 'Not simulated yet'}
              </p>

              <button
                onClick={() => handleDelete(device.id)}
                style={styles.deleteButton}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </section>
    </div>
  )
}

const styles = {
  container: {
    maxWidth: '900px',
    margin: '30px auto',
    padding: '20px',
  },
  title: {
    color: '#3f51b5',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '20px',
    marginBottom: '25px',
    borderRadius: '10px',
    boxShadow: '0 4px 15px rgba(0, 150, 150, 0.12)',
  },
  text: {
    color: '#555',
    fontSize: '14px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  input: {
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #b2ebf2',
  },
  checkboxLabel: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    fontSize: '14px',
  },
  button: {
    padding: '10px',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: '#3f51b5',
    color: 'white',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  deleteButton: {
    padding: '7px 10px',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: '#d32f2f',
    color: 'white',
    cursor: 'pointer',
  },
  item: {
    borderBottom: '1px solid #e0f7fa',
    padding: '10px 0',
  },
  error: {
    color: '#d32f2f',
  },
  success: {
    color: '#00796b',
  },
}

export default SmartGlucometers