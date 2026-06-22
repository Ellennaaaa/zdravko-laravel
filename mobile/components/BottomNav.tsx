import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native'
import { useRouter, usePathname } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import NotificationBell from './NotificationBell'

export default function BottomNav({ user }: any) {
  const router = useRouter()
  const pathname = usePathname()
  const insets = useSafeAreaInsets()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const roleNames = user?.roles?.map((role: any) => role.name) || []

  const isAdmin = roleNames.includes('admin')
  const isPatient = roleNames.includes('patient')
  const isContact = roleNames.includes('contact')
  const isPatientContact = isPatient && isContact

  type NavLink = {
    path: string
    label: string
    icon: keyof typeof Ionicons.glyphMap
  }

  const patientLinks: NavLink[] = [
    { path: '/dashboard', label: 'Dijagram', icon: 'bar-chart-outline' },
    { path: '/measurements', label: 'Mjerenja', icon: 'water-outline' },
    { path: '/therapies', label: 'Terapija', icon: 'medkit-outline' },
    { path: '/emergency-contacts', label: 'Kontakti', icon: 'call-outline' },
  ]

  const contactLinks: NavLink[] = [
    { path: '/contact-dashboard', label: 'Pacijenti', icon: 'people-outline' },
    { path: '/become-patient', label: 'Postani pacijent', icon: 'add-circle-outline' },
  ]

  const patientContactLinks: NavLink[] = [
    ...patientLinks,
    { path: '/contact-dashboard', label: 'Praćeni pacijenti', icon: 'people-outline' },
  ]

  const adminLinks: NavLink[] = [
    { path: '/admin', label: 'Admin', icon: 'settings-outline' },
  ]

  const links = isAdmin
    ? adminLinks
    : isPatientContact
      ? patientContactLinks
      : isPatient
        ? patientLinks
        : contactLinks

  const navigate = (path: string) => {
    setDrawerOpen(false)
    router.push(path as any)
  }

  return (
    <View style={{ paddingTop: insets.top }}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.menuBtn} onPress={() => setDrawerOpen(true)}>
          <Ionicons name="menu-outline" size={28} color="#3f51b5" />
        </TouchableOpacity>

        <Text style={styles.logo}>Zdravko</Text>

        <View style={styles.topRight}>
          <NotificationBell />
          <TouchableOpacity style={styles.profileBtn} onPress={() => router.push('/profile')}>
            <Text style={styles.profileText}>
              {user?.username?.charAt(0)?.toUpperCase() || '?'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={drawerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setDrawerOpen(false)}
      >
        <View style={styles.overlay}>
          <View style={[styles.drawer, { paddingTop: insets.top + 16 }]}>

            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>Zdravko</Text>
              <TouchableOpacity onPress={() => setDrawerOpen(false)}>
                <Ionicons name="close-outline" size={26} color="#999" />
              </TouchableOpacity>
            </View>

            <View style={styles.drawerAvatar}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.username?.charAt(0)?.toUpperCase() || '?'}
                </Text>
              </View>
              <Text style={styles.drawerUsername}>{user?.username}</Text>
            </View>

            {links.map((link) => {
              const active = pathname === link.path
              return (
                <TouchableOpacity
                  key={link.path}
                  style={[styles.drawerLink, active && styles.activeDrawerLink]}
                  onPress={() => navigate(link.path)}
                >
                  <Ionicons
                    name={active ? (link.icon.replace('-outline', '') as any) : link.icon}
                    size={20}
                    color={active ? '#3f51b5' : '#555'}
                    style={styles.linkIcon}
                  />
                  <Text style={[styles.drawerLinkText, active && styles.activeDrawerLinkText]}>
                    {link.label}
                  </Text>
                </TouchableOpacity>
              )
            })}

            <TouchableOpacity
              style={[styles.drawerLink, pathname === '/profile' && styles.activeDrawerLink]}
              onPress={() => navigate('/profile')}
            >
              <Ionicons
                name={pathname === '/profile' ? 'person' : 'person-outline'}
                size={20}
                color={pathname === '/profile' ? '#3f51b5' : '#555'}
                style={styles.linkIcon}
              />
              <Text style={[styles.drawerLinkText, pathname === '/profile' && styles.activeDrawerLinkText]}>
                Profil
              </Text>
            </TouchableOpacity>

          </View>

          <TouchableOpacity
            style={styles.overlayBg}
            activeOpacity={1}
            onPress={() => setDrawerOpen(false)}
          />
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0f0f0',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuBtn: {
    padding: 4,
  },
  logo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3f51b5',
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  profileBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3f51b5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  drawer: {
    width: '70%',
    backgroundColor: 'white',
    height: '100%',
    padding: 20,
  },
  overlayBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3f51b5',
  },
  drawerAvatar: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3f51b5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  avatarText: {
    color: 'white',
    fontSize: 26,
    fontWeight: 'bold',
  },
  drawerUsername: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  drawerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 6,
  },
  activeDrawerLink: {
    backgroundColor: '#e8eaf6',
  },
  linkIcon: {
    marginRight: 12,
  },
  drawerLinkText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  activeDrawerLinkText: {
    color: '#3f51b5',
    fontWeight: 'bold',
  },
})
