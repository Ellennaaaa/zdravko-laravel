import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { acceptContactInvitation } from '../api/emergencyContacts'

function AcceptContactInvitation() {
  const location = useLocation()
  const navigate = useNavigate()

  const invitationToken = new URLSearchParams(location.search).get('token')

  const [formData, setFormData] = useState({
    password: '',
    password_confirmation: '',
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
      const response = await acceptContactInvitation({
        token: invitationToken,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
      })

      localStorage.setItem('token', response.data.token)

      setSuccess(response.data.message)

      navigate('/dashboard')
    } catch (err) {
      if (err.response?.status === 422) {
        const errors = err.response.data.errors
        setError(Object.values(errors).flat().join(', '))
      } else {
        setError(err.response?.data?.error || 'Something went wrong.')
      }
    }
  }

  if (!invitationToken) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>Invalid Invitation</h1>
          <p style={styles.error}>Missing invitation token.</p>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Prihvati poziv - postani hitni kontakt</h1>

        <p style={styles.text}>
          Napravite lozinku za svoj nalog.
        </p>

        {success && <p style={styles.success}>{success}</p>}
        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            name="password"
            type="password"
            placeholder="Lozinka"
            value={formData.password}
            onChange={handleChange}
            style={styles.input}
          />

          <input
            name="password_confirmation"
            type="password"
            placeholder="Potvrdite lozinku"
            value={formData.password_confirmation}
            onChange={handleChange}
            style={styles.input}
          />

          <button type="submit" style={styles.button}>
            Prihvatite poziv
          </button>
        </form>
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(to right, #e0f7fa, #f0ffff)',
    padding: '20px',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 4px 15px rgba(0, 150, 150, 0.15)',
    width: '350px',
    textAlign: 'center',
  },
  title: {
    marginBottom: '20px',
    color: '#3f51b5',
  },
  text: {
    fontSize: '14px',
    color: '#555',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  input: {
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #b2ebf2',
    fontSize: '14px',
    outline: 'none',
  },
  button: {
    padding: '12px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#3f51b5',
    color: 'white',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '14px',
  },
  error: {
    color: '#d32f2f',
  },
  success: {
    color: '#00796b',
  },
}

export default AcceptContactInvitation