import { useEffect, useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import {
  getEmergencyContacts,
  getEmergencyContactInvitations,
  sendEmergencyContactInvitation,
  deleteEmergencyContact,
} from '../src/api/emergency'

export default function EmergencyContacts() {
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
      setError('Neuspješno učitavanje hitnih kontakata.')
    }
  }

  const handleSubmit = async () => {
    setError(null)
    setSuccess(null)
    try {
      await sendEmergencyContactInvitation(formData)
      setSuccess('Poziv za hitnog kontakta uspješno poslat!')
      setFormData({ name: '', email: '', phone_number: '', relationship: '' })
      loadData()
    } catch (err: any) {
      if (err.response?.status === 422) {
        setError(Object.values(err.response.data.errors).flat().join(', '))
      } else {
        setError(err.response?.data?.error || '!')
      }
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteEmergencyContact(id)
      setSuccess('Hitni kontakt uklonjen.')
      loadData()
    } catch {
      setError('Neuspješno uklanjanje hitnog kontakta.')
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Hitni Kontakti</Text>

      {success && <Text style={styles.success}>{success}</Text>}
      {error && <Text style={styles.error}>{error}</Text>}

      {/* Add contact form */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Dodaj hitni kontakt</Text>
        <Text style={styles.cardSubtitle}>
          Unesi informacije o kontaktu. Aplikacija će im poslati mejl poziva.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Ime"
          placeholderTextColor="#999"
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#999"
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Broj telefona"
          placeholderTextColor="#999"
          value={formData.phone_number}
          onChangeText={(text) => setFormData({ ...formData, phone_number: text })}
          keyboardType="phone-pad"
        />
        <TextInput
          style={styles.input}
          placeholder="Veza (član porodice, prijatelj ...)"
          placeholderTextColor="#999"
          value={formData.relationship}
          onChangeText={(text) => setFormData({ ...formData, relationship: text })}
        />

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Pošalji zahtjev</Text>
        </TouchableOpacity>
      </View>

      {/* Accepted contacts */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Prihvaćeni kontakti</Text>
        {contacts.length === 0 ? (
          <Text style={styles.empty}>Nema hitnih kontakata.</Text>
        ) : (
          contacts.map((contact: any) => (
            <View key={contact.id} style={styles.item}>
              <Text style={styles.itemTitle}>{contact.contact_user?.username}</Text>
              <Text style={styles.itemText}>Email: {contact.contact_user?.email}</Text>
              <Text style={styles.itemText}>Broj telefona: {contact.contact_user?.phone_number}</Text>
              <Text style={styles.itemText}>Veza: {contact.relationship}</Text>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(contact.id)}
              >
                <Text style={styles.buttonText}>Ukloni</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      {/* Pending invitations */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Poslati zahtjevi</Text>
        {invitations.length === 0 ? (
          <Text style={styles.empty}>Nema poslatih zahtjeva.</Text>
        ) : (
          invitations.map((invitation: any) => (
            <View key={invitation.id} style={styles.item}>
              <Text style={styles.itemTitle}>{invitation.name}</Text>
              <Text style={styles.itemText}>Email: {invitation.email}</Text>
              <Text style={styles.itemText}>Broj telefona: {invitation.phone_number}</Text>
              <Text style={styles.itemText}>Veza: {invitation.relationship}</Text>
              <Text style={styles.itemText}>
                Status: {invitation.accepted_at ? 'Prihvaćen' : 'Čeka se odgovor'}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5fafa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3f51b5',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
  },
  input: {
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#b2ebf2',
    fontSize: 14,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#3f51b5',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#d32f2f',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  item: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0f7fa',
    paddingVertical: 12,
  },
  itemTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  itemText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  empty: {
    color: '#999',
    textAlign: 'center',
    padding: 10,
  },
  error: {
    color: '#d32f2f',
    marginBottom: 10,
    textAlign: 'center',
  },
  success: {
    color: '#00796b',
    marginBottom: 10,
    textAlign: 'center',
  },
})