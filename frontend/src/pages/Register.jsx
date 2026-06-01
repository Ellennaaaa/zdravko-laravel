import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { register } from '../api/auth'

function Register() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone_number: '',
    role: 'patient',
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
      const response = await register(formData)

      localStorage.setItem('token', response.data.token)

      setSuccess(response.data.message)

      navigate('/measurements')

    } catch (err) {
      if (err.response?.status === 422) {
        const errors = err.response.data.errors
        setError(Object.values(errors).flat().join(', '))
      } else {
        setError(err.response?.data?.message || 'Something went wrong')
      }
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Registracija</h1>

        {success && <p style={styles.success}>{success}</p>}
        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            style={styles.input}
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            style={styles.input}
          />

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
            placeholder="Potvrdi lozinku"
            value={formData.password_confirmation}
            onChange={handleChange}
            style={styles.input}
          />

          <input
            name="phone_number"
            placeholder="Broj telefona"
            value={formData.phone_number}
            onChange={handleChange}
            style={styles.input}
          />

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            style={styles.input}
          >
            <option value="patient">Pacijent</option>
            <option value="contact">Kontakt</option>
          </select>

          {formData.role === 'patient' && (
            <>
              <input
                name="birth_date"
                type="date"
                value={formData.birth_date}
                onChange={handleChange}
                style={styles.input}
              />

              <select
                name="diabetes_type_id"
                value={formData.diabetes_type_id}
                onChange={handleChange}
                style={styles.input}
              >
                <option value={1}>Dijabetes tipa 1</option>
                <option value={2}>Dijabetes tipa 2</option>
              </select>
            </>
          )}

          <button type="submit" style={styles.button}>
            Registruj se
          </button>
        </form>

        <p style={styles.footerText}>
          Already have an account?{' '}
          <a href="/login" style={styles.link}>
            Login
          </a>
        </p>
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
    marginBottom: '10px',
    fontSize: '14px',
  },
  success: {
    color: '#00796b',
    marginBottom: '10px',
    fontSize: '14px',
  },
  footerText: {
    marginTop: '16px',
    fontSize: '14px',
  },
  link: {
    color: '#00acc1',
    textDecoration: 'none',
    fontWeight: 'bold',
  },
}

export default Register