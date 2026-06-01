import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { getUser } from './api/auth'
import Layout from './components/Layout'

import Register from './pages/Register'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Measurements from './pages/Measurements'
import Therapies from './pages/Therapies'
import EmergencyContacts from './pages/EmergencyContacts'
import AcceptContactInvitation from './pages/AcceptContactInvitation'

function App() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    getUser()
      .then((response) => setUser(response.data.user))
      .catch(() => setUser(null))
  }, [])

  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/accept-contact-invitation" element={<AcceptContactInvitation />} />

      
      <Route path="/dashboard" element={<Layout user={user}><Dashboard user={user} /></Layout>}/>
      <Route path="/" element={ <Layout user={user}> <Dashboard user={user} /></Layout>}/>
      <Route path="/measurements" element={<Layout user={user}><Measurements /></Layout>} />
      <Route path="/therapies" element={<Layout user={user}><Therapies /></Layout>} />
      <Route path="/emergency-contacts" element={<Layout user={user}><EmergencyContacts /></Layout>} />
    </Routes>
  )
}

export default App