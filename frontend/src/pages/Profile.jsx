import { useNavigate } from 'react-router-dom'
import { logout } from '../api/auth'

function Profile({ user, setUser }) {
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
    } catch {}

    localStorage.removeItem('token')
    setUser(null)
    navigate('/login')
  }

  const roles = user?.roles?.map((role) => role.name).join(', ')

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.avatar}>
          {user?.username?.charAt(0)?.toUpperCase()}
        </div>

        <h1 style={styles.title}>My Profile</h1>

        <p><strong>Korisnicko ime:</strong> {user?.username}</p>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Broj telefona:</strong> {user?.phone_number}</p>
        <p><strong>Uloga:</strong> {roles}</p>

        <button onClick={handleLogout} style={styles.logoutButton}>
          Odjaviti se
        </button>
      </div>
    </div>
  )
}

const styles = {
  container: {
    maxWidth: '700px',
    margin: '40px auto',
    padding: '20px',
  },
  card: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 4px 15px rgba(0,150,150,0.12)',
    textAlign: 'center',
  },
  avatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#3f51b5',
    color: 'white',
    fontSize: '36px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
  },
  title: {
    color: '#3f51b5',
  },
  logoutButton: {
    marginTop: '20px',
    padding: '12px 20px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#d32f2f',
    color: 'white',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
}

export default Profile