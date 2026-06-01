import { useEffect, useState } from 'react'
import {
  getEmergencyContacts,
  getEmergencyContactInvitations,
  sendEmergencyContactInvitation,
  deleteEmergencyContact,
} from '../api/emergencyContacts'

function EmergencyContacts() {
  const [contacts, setContacts] = useState([])
  const [invitations, setInvitations] = useState([])

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_number: '',
    relationship: '',
  })

  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const contactsResponse = await getEmergencyContacts()
      const invitationsResponse = await getEmergencyContactInvitations()

      setContacts(contactsResponse.data.emergency_contacts)
      setInvitations(invitationsResponse.data.invitations)
    } catch {
      setError('Neuspjesno ucitavanje hitnih kontakata.')
    }
  }

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
      await sendEmergencyContactInvitation(formData)

      setSuccess('Poziv za hitnog kontakta uspjesno poslat')

      setFormData({
        name: '',
        email: '',
        phone_number: '',
        relationship: '',
      })

      loadData()
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
    try {
      await deleteEmergencyContact(id)
      setSuccess('Emergency contact removed.')
      loadData()
    } catch {
      setError('Failed to delete emergency contact.')
    }
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Hitni kontakti</h1>

      {success && <p style={styles.success}>{success}</p>}
      {error && <p style={styles.error}>{error}</p>}

      <section style={styles.card}>
        <h2>Dodaj hitni kontakt</h2>
        <p style={styles.text}>
          Unesi informacije o kontaktu. Aplikacija ce im poslati mejl poziva.
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            name="name"
            placeholder="Full name"
            value={formData.name}
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
            name="phone_number"
            placeholder="Phone number"
            value={formData.phone_number}
            onChange={handleChange}
            style={styles.input}
          />

          <input
            name="relationship"
            placeholder="Relationship, e.g. mother"
            value={formData.relationship}
            onChange={handleChange}
            style={styles.input}
          />

          <button type="submit" style={styles.button}>
            Send Invitation
          </button>
        </form>
      </section>

      <section style={styles.card}>
        <h2>Prihvaceni kontakti</h2>

        {contacts.length === 0 ? (
          <p>No accepted emergency contacts yet.</p>
        ) : (
          contacts.map((contact) => (
            <div key={contact.id} style={styles.item}>
              <p>
                <strong>{contact.contact_user?.username}</strong>
              </p>
              <p>Email: {contact.contact_user?.email}</p>
              <p>Phone: {contact.contact_user?.phone_number}</p>
              <p>Relationship: {contact.relationship}</p>

              <button
                onClick={() => handleDelete(contact.id)}
                style={styles.deleteButton}
              >
                Remove
              </button>
            </div>
          ))
        )}
      </section>

      <section style={styles.card}>
        <h2>Pending Invitations</h2>

        {invitations.length === 0 ? (
          <p>No pending invitations.</p>
        ) : (
          invitations.map((invitation) => (
            <div key={invitation.id} style={styles.item}>
              <p>
                <strong>{invitation.name}</strong>
              </p>
              <p>Email: {invitation.email}</p>
              <p>Phone: {invitation.phone_number}</p>
              <p>Relationship: {invitation.relationship}</p>
              <p>
                Status:{' '}
                {invitation.accepted_at ? 'Accepted' : 'Pending'}
              </p>
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

export default EmergencyContacts