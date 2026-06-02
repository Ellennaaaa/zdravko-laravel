import { useEffect, useState } from 'react'
import {
  getMeasurements,
  storeMeasurement,
  updateMeasurement,
  deleteMeasurement,
} from '../api/measurements'

function Measurements() {
  const [measurements, setMeasurements] = useState([])
  const [formData, setFormData] = useState({
    value: '',
    blood_glucose_unit_id: 1,
    measured_on: '',
  })

  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    fetchMeasurements()
  }, [])

  const fetchMeasurements = async () => {
    try {
      const response = await getMeasurements()
      setMeasurements(response.data.measurements)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load measurements.')
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const resetForm = () => {
    setFormData({
      value: '',
      blood_glucose_unit_id: 1,
      measured_on: '',
    })
    setEditingId(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    try {
      if (editingId) {
        await updateMeasurement(editingId, formData)
        setSuccess('Measurement updated successfully.')
      } else {
        await storeMeasurement(formData)
        setSuccess('Measurement added successfully.')
      }

      resetForm()
      fetchMeasurements()
    } catch (err) {
      if (err.response?.status === 422) {
        const errors = err.response.data.errors
        setError(Object.values(errors).flat().join(', '))
      } else {
        setError(err.response?.data?.error || 'Something went wrong.')
      }
    }
  }

  const handleEdit = (measurement) => {
    setEditingId(measurement.id)

    setFormData({
      value: measurement.value,
      blood_glucose_unit_id: measurement.blood_glucose_unit_id,
      measured_on: measurement.measured_on || '',
    })
  }

  const handleDelete = async (id) => {
    setError(null)
    setSuccess(null)

    try {
      await deleteMeasurement(id)
      setSuccess('Measurement deleted successfully.')
      fetchMeasurements()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete measurement.')
    }
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Mjerenja</h1>

      {success && <p style={styles.success}>{success}</p>}
      {error && <p style={styles.error}>{error}</p>}

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          name="value"
          type="number"
          step="0.01"
          placeholder="Vrijednost nivoa glukoze u krvi"
          value={formData.value}
          onChange={handleChange}
          style={styles.input}
        />

        <select
          name="blood_glucose_unit_id"
          value={formData.blood_glucose_unit_id}
          onChange={handleChange}
          style={styles.input}
        >
          <option value={1}>mg/dL</option>
          <option value={2}>mmol/L</option>
        </select>

        <input
          name="measured_on"
          type="date"
          value={formData.measured_on}
          onChange={handleChange}
          style={styles.input}
        />

        <button type="submit" style={styles.button}>
          {editingId ? 'Azuriraj mjerenje' : 'Dodaj mjerenje'}
        </button>

        {editingId && (
          <button type="button" onClick={resetForm} style={styles.cancelButton}>
            Zatvori
          </button>
        )}
      </form>

      <h2 style={styles.subtitle}>Istorija</h2>

      {measurements.length === 0 ? (
        <p>No measurements yet.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Vrijednost</th>
              <th>Jedinica mjere</th>
              <th>Datum</th>
              <th>Akcije</th>
            </tr>
          </thead>

          <tbody>
            {measurements.map((measurement) => (
              <tr key={measurement.id}>
                <td>{measurement.value}</td>
                <td>{measurement.blood_glucose_unit?.symbol}</td>
                <td>{measurement.measured_on || '—'}</td>
                <td>
                  <button
                    onClick={() => handleEdit(measurement)}
                    style={styles.smallButton}
                  >
                    Izmijeni
                  </button>

                  <button
                    onClick={() => handleDelete(measurement.id)}
                    style={styles.deleteButton}
                  >
                    Izbrisi
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '40px auto',
    padding: '20px',
  },
  title: {
    color: '#3f51b5',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: '30px',
  },
  form: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    marginBottom: '20px',
  },
  input: {
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #b2ebf2',
  },
  button: {
    padding: '10px 15px',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: '#3f51b5',
    color: 'white',
    cursor: 'pointer',
  },
  cancelButton: {
    padding: '10px 15px',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: '#9e9e9e',
    color: 'white',
    cursor: 'pointer',
  },
  smallButton: {
    marginRight: '8px',
    padding: '6px 10px',
    border: 'none',
    borderRadius: '5px',
    backgroundColor: '#00acc1',
    color: 'white',
    cursor: 'pointer',
  },
  deleteButton: {
    padding: '6px 10px',
    border: 'none',
    borderRadius: '5px',
    backgroundColor: '#d32f2f',
    color: 'white',
    cursor: 'pointer',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  success: {
    color: 'green',
  },
  error: {
    color: 'red',
  },
}

export default Measurements