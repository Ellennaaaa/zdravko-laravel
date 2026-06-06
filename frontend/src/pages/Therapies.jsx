import { useEffect, useState } from 'react'
import {
  getTherapies,
  storeTherapy,
  deleteTherapy,
  getTherapyLogs,
  storeTherapyLog,
  deleteTherapyLog,
} from '../api/therapies'

function Therapies() {
  const [therapies, setTherapies] = useState([])
  const [therapyLogs, setTherapyLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [therapyData, setTherapyData] = useState({
    medicine_id: 1,
    dosage: '',
    unit_id: 1,
    times_per_day: 1,
    start_time: '',
    start_date: '',
    end_date: '',
    note: '',
  })

  const [logData, setLogData] = useState({
    therapy_id: '',
    medicine_id: 1,
    dosage: '',
    unit_id: 1,
    taken_at: '',
    note: '',
  })

  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
  setLoading(true)

    try {
      const therapiesResponse = await getTherapies()
      const logsResponse = await getTherapyLogs()

      setTherapies(therapiesResponse.data.therapies || [])
      setTherapyLogs(logsResponse.data.therapy_logs || [])
    } catch (err) {
      setError('Greška')
    } finally {
      setLoading(false)
    }
}

  const handleTherapyChange = (e) => {
    setTherapyData({
      ...therapyData,
      [e.target.name]: e.target.value,
    })
  }

  const handleLogChange = (e) => {
    setLogData({
      ...logData,
      [e.target.name]: e.target.value,
    })
  }

  const handleTherapySubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    try {
      await storeTherapy(therapyData)

      setSuccess('Plan terapije uspješno dodat.')

      setTherapyData({
        medicine_id: 1,
        dosage: '',
        unit_id: 1,
        times_per_day: 1,
        start_time: '',
        start_date: '',
        end_date: '',
        note: '',
      })

      loadData()
    } catch (err) {
      handleError(err)
    }
  }

  const handleLogSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    try {
      await storeTherapyLog(logData)

      setSuccess('Zapis o terapiji uspješno unesen.')

      setLogData({
        therapy_id: '',
        medicine_id: 1,
        dosage: '',
        unit_id: 1,
        taken_at: '',
        note: '',
      })

      loadData()
    } catch (err) {
      handleError(err)
    }
  }

  const handleDeleteTherapy = async (id) => {
    try {
      await deleteTherapy(id)
      setSuccess('Terapija izbrisana.')
      loadData()
    } catch {
      setError('Greška')
    }
  }

  const handleDeleteLog = async (id) => {
    try {
      await deleteTherapyLog(id)
      setSuccess('Izbrisan zapis terapije.')
      loadData()
    } catch {
      setError('Greška')
    }
  }

  const handleError = (err) => {
    if (err.response?.status === 422) {
      const errors = err.response.data.errors
      setError(Object.values(errors).flat().join(', '))
    } else {
      setError(err.response?.data?.error || 'Greška.')
    }
  }

  const today = new Date()

  const activeTherapies = therapies.filter((therapy) => {
    const startDate = therapy.start_date ? new Date(therapy.start_date) : null
    const endDate = therapy.end_date ? new Date(therapy.end_date) : null

    const started = !startDate || startDate <= today
    const notEnded = !endDate || endDate >= today

    return started && notEnded
})
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Terapije</h1>

      {success && <p style={styles.success}>{success}</p>}
      {error && <p style={styles.error}>{error}</p>}

      <section style={styles.card}>
        <h2>Dodaj plan terapije</h2>

        <form onSubmit={handleTherapySubmit} style={styles.form}>
          <select
            name="medicine_id"
            value={therapyData.medicine_id}
            onChange={handleTherapyChange}
            style={styles.input}
          >
            <option value={1}>Insulin</option>
            <option value={2}>Metformin</option>
          </select>

          <input
            name="dosage"
            type="number"
            step="0.01"
            placeholder="Doza"
            value={therapyData.dosage}
            onChange={handleTherapyChange}
            style={styles.input}
          />

          <select
            name="unit_id"
            value={therapyData.unit_id}
            onChange={handleTherapyChange}
            style={styles.input}
          >
            <option value={1}>mg</option>
            <option value={2}>ml</option>
            <option value={3}>tableta</option>
            <option value={4}>IU</option>
          </select>

          <input
            name="times_per_day"
            type="number"
            min="1"
            value={therapyData.times_per_day}
            onChange={handleTherapyChange}
            style={styles.input}
          />

          <input
            name="start_time"
            type="time"
            value={therapyData.start_time}
            onChange={handleTherapyChange}
            style={styles.input}
          />

          <input
            name="start_date"
            type="date"
            value={therapyData.start_date}
            onChange={handleTherapyChange}
            style={styles.input}
          />

          <input
            name="end_date"
            type="date"
            value={therapyData.end_date}
            onChange={handleTherapyChange}
            style={styles.input}
          />

          <textarea
            name="note"
            placeholder="Bilješka"
            value={therapyData.note}
            onChange={handleTherapyChange}
            style={styles.textarea}
          />

          <button type="submit" style={styles.button}>
            Dodajte terapiju
          </button>
        </form>
      </section>

      <section style={styles.card}>
        <h2>Moji planovi terapije</h2>

        {loading ? (
          <p>Učitavanje planova terapije...</p>
        ) : therapies.length === 0 ? (
          <p>Još uvijek nema planova terapije</p>
        ) : (
          therapies.map((therapy) => (
            <div key={therapy.id} style={styles.item}>
              <p>
                <strong>{therapy.medicine?.name}</strong> — {therapy.dosage}{' '}
                {therapy.unit?.symbol}, {therapy.times_per_day}x dnevno
              </p>
              <p>
                Od{' '}
                {therapy.start_date
                  ? new Date(therapy.start_date).toLocaleDateString('sr-RS')
                  : '-'}
                {' '}do{' '}
                {therapy.end_date
                  ? new Date(therapy.end_date).toLocaleDateString('sr-RS')
                  : 'ongoing'}
              </p>
              <p>{therapy.note}</p>

              <button
                onClick={() => handleDeleteTherapy(therapy.id)}
                style={styles.deleteButton}
              >
                Obriši
              </button>
            </div>
          ))
        )}
      </section>

      <section style={styles.card}>
        <h2>Dodajte uzetu terapiju</h2>

        <form onSubmit={handleLogSubmit} style={styles.form}>
          <select
            name="therapy_id"
            value={logData.therapy_id}
            onChange={handleLogChange}
            style={styles.input}
          >
            <option value="">Plan terapije</option>
            {activeTherapies.map((therapy) => (
              <option key={therapy.id} value={therapy.id}>
                {therapy.medicine?.name} — {therapy.dosage} {therapy.unit?.symbol}
              </option>
            ))}
          </select>

          <select
            name="medicine_id"
            value={logData.medicine_id}
            onChange={handleLogChange}
            style={styles.input}
          >
            <option value={1}>Insulin</option>
            <option value={2}>Metformin</option>
          </select>

          <input
            name="dosage"
            type="number"
            step="0.01"
            placeholder="Uzeta doza"
            value={logData.dosage}
            onChange={handleLogChange}
            style={styles.input}
          />

          <select
            name="unit_id"
            value={logData.unit_id}
            onChange={handleLogChange}
            style={styles.input}
          >
            <option value={1}>mg</option>
            <option value={2}>ml</option>
            <option value={3}>tableta</option>
            <option value={4}>IU</option>
          </select>

          <input
            name="taken_at"
            type="datetime-local"
            value={logData.taken_at}
            onChange={handleLogChange}
            style={styles.input}
          />

          <textarea
            name="note"
            placeholder="Biljeska"
            value={logData.note}
            onChange={handleLogChange}
            style={styles.textarea}
          />

          <button type="submit" style={styles.button}>
            Sacuvajte zapis o terapiji.
          </button>
        </form>
      </section>

      <section style={styles.card}>
        <h2>Zapisi o terapiji.</h2>

        {loading ? (
          <p>Učitavanje zapisa o terapiji...</p>
        ) : therapyLogs.length === 0 ? (
          <p>Još uvijek nema zapisa o terapiji.</p>
        ) : (
          therapyLogs.map((log) => (
            <div key={log.id} style={styles.item}>
              <p>
                <strong>{log.medicine?.name}</strong> — {log.dosage}{' '}
                {log.unit?.symbol}
              </p>
              <p>
                Uzeto:{' '}
                {new Date(log.taken_at).toLocaleDateString('sr-RS')} {' '}
                {new Date(log.taken_at).toLocaleTimeString('sr-RS', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              <p>{log.note}</p>

              <button
                onClick={() => handleDeleteLog(log.id)}
                style={styles.deleteButton}
              >
                Obriši
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
  textarea: {
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #b2ebf2',
    minHeight: '70px',
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

export default Therapies