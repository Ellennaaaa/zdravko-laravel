import { Link, useLocation } from 'react-router-dom'
import '../styles/layout.css'
import NotificationBell from './NotificationBell'

function Layout({ children, user }) {
  const location = useLocation()
  const roleNames = user?.roles?.map((role) => role.name) || []

  const isPatient = roleNames.includes('patient')
  const isContact = roleNames.includes('contact')

  const patientLinks = [
    { path: '/dashboard', label: 'Dijagram' },
    { path: '/measurements', label: 'Mjerenja' },
    { path: '/therapies', label: 'Terapija' },
    { path: '/emergency-contacts', label: 'Hitni kontakti' },
  ]

  const contactLinks = [
    { path: '/dashboard', label: 'Dijagram' },
    { path: '/reminders', label: 'Podsjetnici' },
  ]

  const links = isPatient ? patientLinks : contactLinks
  return (
    <div style={styles.page}>
      <main style={styles.content}>
        {children}
      </main>

      <nav style={styles.navbar}>
        <h2 style={styles.logo}>Zdravko</h2>

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
    marginRight: '240px',
  },
  navbar: {
    position: 'fixed',
    right: 0,
    top: 0,
    width: '220px',
    height: '100vh',
    backgroundColor: '#ffffff',
    boxShadow: '-4px 0 15px rgba(0, 150, 150, 0.12)',
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
}

export default Layout