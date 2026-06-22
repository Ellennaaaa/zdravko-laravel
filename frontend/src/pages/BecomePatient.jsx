import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { becomePatient } from '../api/profile'
import { getUser } from '../api/auth'

function BecomePatient({ setUser }) {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    birth_date: '',
    diabetes_type_id: 1,
  })

  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    try {
      const response = await becomePatient(formData)
      setSuccess(response.data.message)

      const userResponse = await getUser()
      setUser(userResponse.data.user)

      navigate('/dashboard')
    } catch (err) {
      if (err.response?.status === 422) {
        const errors = err.response.data.errors
        setError(Object.values(errors).flat().join(', '))
      } else {
        setError(err.response?.data?.message || 'Something went wrong.')
      }
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Become Patient</h1>

        {success && <p style={styles.success}>{success}</p>}
        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <label>Birth date</label>
          <input
            name="birth_date"
            type="date"
            value={formData.birth_date}
            onChange={handleChange}
            style={styles.input}
          />

          <label>Diabetes type</label>
          <select
            name="diabetes_type_id"
            value={formData.diabetes_type_id}
            onChange={handleChange}
            style={styles.input}
          >
            <option value={1}>Type 1</option>
            <option value={2}>Type 2</option>
          </select>

          <button type="submit" style={styles.button}>
            Confirm
          </button>
        </form>
      </div>
    </div>
  )
}

const styles = {
  container: {
    maxWidth: '600px',
    margin: '40px auto',
    padding: '20px',
  },
  card: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '10px',
    boxShadow: '0 4px 15px rgba(0,150,150,0.12)',
  },
  title: {
    color: '#3f51b5',
    textAlign: 'center',
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
  button: {
    padding: '10px',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: '#3f51b5',
    color: 'white',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  success: {
    color: '#00796b',
  },
  error: {
    color: '#d32f2f',
  },
}

export default BecomePatient