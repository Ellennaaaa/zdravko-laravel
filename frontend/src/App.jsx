import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { getUser } from './api/auth'
import Layout from './components/Layout'
import AdminPanel from './pages/AdminPanel'

import ContactDashboard from './pages/ContactDashboard'
import Register from './pages/Register'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Measurements from './pages/Measurements'
import Therapies from './pages/Therapies'
import EmergencyContacts from './pages/EmergencyContacts'
import AcceptContactInvitation from './pages/AcceptContactInvitation'
import SmartGlucometers from './pages/SmartGlucometers'
import Profile from './pages/Profile'
import BecomePatient from './pages/BecomePatient'


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
      <Route path="/login" element={<Login setUser={setUser} />} />
      <Route path="/accept-contact-invitation" element={<AcceptContactInvitation />} />

      
      <Route path="/dashboard" element={<Layout user={user}><Dashboard user={user} /></Layout>}/>
      <Route path="/" element={ <Layout user={user}> <Dashboard user={user} /></Layout>}/>
      <Route path="/measurements" element={<Layout user={user}><Measurements /></Layout>} />
      <Route path="/therapies" element={<Layout user={user}><Therapies /></Layout>} />
      <Route path="/emergency-contacts" element={<Layout user={user}><EmergencyContacts /></Layout>} />
      <Route path="/smart-glucometers" element={<Layout user={user}><SmartGlucometers /></Layout>}/>
      <Route path="/profile" element={<Layout user={user}><Profile user={user} setUser={setUser} /></Layout>}/>
      <Route path="/become-patient" element={<Layout user={user}><BecomePatient setUser={setUser} /></Layout>}/>
      <Route path="/contact-dashboard" element={<Layout user={user}><ContactDashboard /></Layout>}/>
      <Route path="/admin" element={user?.roles?.some(role => role.name === 'admin') ? (<Layout user={user}><AdminPanel /></Layout>): <Navigate to="/dashboard" />}/>
    </Routes>
  )
}

export default App