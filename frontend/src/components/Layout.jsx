import { Link, useLocation, useNavigate } from 'react-router-dom'
import '../styles/layout.css'
import NotificationBell from './NotificationBell'
import { sendSos } from '../api/sos'


function Layout({ children, user }) {
  const location = useLocation()
  const navigate = useNavigate()
  const roleNames = user?.roles?.map((role) => role.name) || []

  const isAdmin = roleNames.includes('admin')
  const isPatient = roleNames.includes('patient')
  const isContact = roleNames.includes('contact')
  const isPatientContact = isPatient && isContact

  const patientLinks = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/measurements', label: 'Measurements' },
    { path: '/therapies', label: 'Therapies' },
    { path: '/emergency-contacts', label: 'Emergency Contacts' },
    { path: '/smart-glucometers', label: 'Smart Glucometers' },
  ]

  const contactLinks = [
    { path: '/contact-dashboard', label: 'Patient Dashboard' },
    { path: '/become-patient', label: 'Become Patient' },
  ]

  const patientContactLinks = [
    ...patientLinks,
    { path: '/contact-dashboard', label: 'Monitored Patients' },
  ]

  const adminLinks = [
    { path: '/admin', label: 'Admin Panel' },
  ]

  const links = isAdmin
    ? adminLinks
    : isPatientContact
      ? patientContactLinks
      : isPatient
        ? patientLinks
        : contactLinks

  const handleSos = async () => {
  const confirmed = window.confirm(
    'Da li ste sigurni da želite da pošaljete SOS poruku svim hitnim kontaktima'
  )

  if (!confirmed) return

  try {
    const response = await sendSos()

    alert(response.data.message)
  } catch (err) {
    alert(
      err.response?.data?.message ||
      'Greška. Nije uspjelo slanje SOS poruke'
    )
  }
}

  return (
    <div style={styles.page}>
      <main style={styles.content}>
        {children}
      </main>

      <nav style={styles.navbar}>
        <h2 style={styles.logo}>Zdravko</h2>
        <button onClick={() => navigate('/profile')}style={styles.profileCircle}>{user?.username?.charAt(0)?.toUpperCase() || '?'}</button>
        <NotificationBell/>

        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className="nav-button"
            style={{
              ...styles.navButton,
              ...(location.pathname === link.path ? styles.activeButton : {}),
            }}
          >
            {link.label}
          </Link>
        ))}

        {isPatient && (
          <button
            onClick={handleSos}
            style={styles.sosButton}
          >
            🚨 SOS
          </button>
        )}
      </nav>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    background: 'linear-gradient(to right, #e0f7fa, #f0ffff)',
  },
  content: {
    flex: 1,
    padding: '30px',
    marginLeft: '240px',
  },
  navbar: {
    position: 'fixed',
    left: 0,
    top: 0,
    width: '220px',
    height: '100vh',
    backgroundColor: '#ffffff',
    boxShadow: '4px 0 15px rgba(0, 150, 150, 0.12)',
    padding: '25px 15px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  logo: {
    color: '#3f51b5',
    textAlign: 'center',
    marginBottom: '20px',
  },
  navButton: {
    padding: '12px',
    borderRadius: '8px',
    textDecoration: 'none',
    color: '#3f51b5',
    fontWeight: 'bold',
    transition: '0.2s',
  },
  activeButton: {
    backgroundColor: '#3f51b5',
    color: 'white',
  },

  sosButton: {
    marginTop: 'auto',
    padding: '16px',
    border: 'none',
    borderRadius: '10px',
    backgroundColor: '#d32f2f',
    color: 'white',
    fontSize: '20px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(211,47,47,0.35)',
},
profileCircle: {
  width: '48px',
  height: '48px',
  borderRadius: '50%',
  border: 'none',
  backgroundColor: '#3f51b5',
  color: 'white',
  fontSize: '20px',
  fontWeight: 'bold',
  cursor: 'pointer',
  alignSelf: 'center',
  marginBottom: '15px',
},
}

export default Layout