import { useEffect, useState, useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Audio } from 'expo-av'
import { getUnreadNotifications, markNotificationAsRead } from '../src/api/notifications'

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([])
  const [open, setOpen] = useState(false)
  const soundRef = useRef<Audio.Sound | null>(null)

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 10000)
    return () => {
      clearInterval(interval)
      stopAlarm()
    }
  }, [])

  const stopAlarm = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync()
        await soundRef.current.unloadAsync()
      } catch {
        // already stopped or unloaded, safe to ignore
      }
      soundRef.current = null
    }
  }

  const playAlarm = async () => {
    // Stop any currently playing alarm first to avoid overlap
    await stopAlarm()
    try {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true })
      const { sound } = await Audio.Sound.createAsync(require('../assets/alarm.mp3'))
      soundRef.current = sound
      await sound.playAsync()
    } catch (err) {
      console.log('Sound error:', err)
    }
  }

  const fetchNotifications = async () => {
    try {
      const response = await getUnreadNotifications()
      const unread = response.data.notifications || []
      if (unread.length > 0) {
        playAlarm()
        setOpen(true)
      }
      setNotifications(unread)
    } catch (err) {
      console.error('Failed to fetch notifications', err)
    }
  }

  const markAsRead = async (id: number) => {
    try {
      await markNotificationAsRead(id)
      const response = await getUnreadNotifications()
      const unread = response.data.notifications || []
      setNotifications(unread)
      // Stop alarm once no unread notifications remain
      if (unread.length === 0) stopAlarm()
    } catch (err) {
      console.error('Failed to mark as read', err)
    }
  }

  return (
    <View>
      <TouchableOpacity style={styles.bellButton} onPress={() => setOpen(!open)}>
        <Ionicons
          name={notifications.length > 0 ? 'notifications' : 'notifications-outline'}
          size={20}
          color="#3f51b5"
        />
        {notifications.length > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {notifications.length > 9 ? '9+' : notifications.length}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Obavještenja</Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <Ionicons name="close-outline" size={24} color="#999" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              {notifications.length === 0 ? (
                <Text style={styles.empty}>Nema nepročitanih obavještenja.</Text>
              ) : (
                notifications.map((notification: any) => (
                  <View key={notification.id} style={styles.notification}>
                    <View style={styles.notifIcon}>
                      <Ionicons name="alert-circle-outline" size={18} color="#3f51b5" />
                    </View>
                    <View style={styles.notifContent}>
                      <Text style={styles.notifTitle}>{notification.data?.title}</Text>
                      <Text style={styles.notifMessage}>{notification.data?.message}</Text>
                      <TouchableOpacity
                        style={styles.readButton}
                        onPress={() => markAsRead(notification.id)}
                      >
                        <Ionicons name="checkmark-outline" size={14} color="white" />
                        <Text style={styles.readButtonText}>Označi kao pročitano</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>

            <TouchableOpacity style={styles.closeButton} onPress={() => setOpen(false)}>
              <Text style={styles.closeButtonText}>Zatvori</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  bellButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#d32f2f',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 2,
    borderColor: 'white',
  },
  badgeText: {
    color: 'white',
    fontSize: 9,
    fontWeight: 'bold',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3f51b5',
  },
  notification: {
    flexDirection: 'row',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0f7fa',
    paddingBottom: 12,
    marginBottom: 12,
  },
  notifIcon: {
    marginTop: 2,
  },
  notifContent: {
    flex: 1,
  },
  notifTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  notifMessage: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  readButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#3f51b5',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  readButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  closeButton: {
    marginTop: 12,
    backgroundColor: '#e0f0f0',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  empty: {
    color: '#999',
    textAlign: 'center',
    padding: 20,
  },
})
