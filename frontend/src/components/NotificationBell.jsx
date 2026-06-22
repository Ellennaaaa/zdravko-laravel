import { useEffect, useState, useRef } from 'react'
import {
  getUnreadNotifications,
  markNotificationAsRead,
} from '../api/notifications'

function NotificationBell() {
  const [notifications, setNotifications] = useState([])
  const [open, setOpen] = useState(false)
  const audioRef = useRef(null)   // ← keep the same instance

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 10000)
    return () => clearInterval(interval)
  }, [])

  const playAlarm = () => {
    // Stop any already-playing alarm before starting a new one
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    const audio = new Audio('/Alarm-Clock-Short-chosic.com_.mp3')
    audioRef.current = audio
    audio.play().catch(() => console.log('Sound blocked until user interacts with page.'))
  }

  const stopAlarm = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current = null
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

  const markAsRead = async (id) => {
    try {
      await markNotificationAsRead(id)
      const response = await getUnreadNotifications()
      const unread = response.data.notifications || []
      setNotifications(unread)
      // Stop the alarm only when there are no more unread notifications
      if (unread.length === 0) stopAlarm()
    } catch (err) {
      console.error('Failed to mark notification as read', err)
    }
  }

  return (
    <div style={styles.wrapper}>
      <button onClick={() => {setOpen(!open)}} style={styles.bellButton}>
        🔔 {notifications.length > 0 && <span>({notifications.length})</span>}
      </button>

      {open && (
        <div style={styles.dropdown}>
          <h3>Obavještenja</h3>

          {notifications.length === 0 ? (
            <p>Nema nepročitanih obavještenja.</p>
          ) : (
            notifications.map((notification) => (
              <div key={notification.id} style={styles.notification}>
                <strong>{notification.data?.title}</strong>
                <p>{notification.data?.message}</p>

                <button
                  onClick={() => markAsRead(notification.id)}
                  style={styles.readButton}
                >
                  Označite kao pročitano.
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

const styles = {
  wrapper: {
    position: 'relative',
  },
  bellButton: {
    padding: '10px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#00acc1',
    color: 'white',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  dropdown: {
    position: 'absolute',
    left: '0',
    top: '45px',
    width: '280px',
    backgroundColor: 'white',
    borderRadius: '10px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
    padding: '15px',
    zIndex: 1000,
  },
  notification: {
    borderBottom: '1px solid #e0f7fa',
    paddingBottom: '10px',
    marginBottom: '10px',
  },
  readButton: {
    padding: '6px 10px',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: '#3f51b5',
    color: 'white',
    cursor: 'pointer',
  },
}

export default NotificationBell