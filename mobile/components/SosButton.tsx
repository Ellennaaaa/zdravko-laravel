import { useEffect, useRef } from 'react'
import { TouchableOpacity, Text, StyleSheet, Linking, View, Animated } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { getEmergencyContacts } from '../src/api/emergency'

export default function SosButton({ user }: any) {
  const insets = useSafeAreaInsets()
  const roleNames = user?.roles?.map((role: any) => role.name) || []
  const isPatient = roleNames.includes('patient')

  const pulseAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.6,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    ).start()
  }, [])

  if (!isPatient) return null

  const handleSos = async () => {
    try {
      const response = await getEmergencyContacts()
      const contacts = response.data.emergency_contacts || []
      if (contacts.length > 0) {
        const phone = contacts[0].contact_user?.phone_number
        if (phone) {
          Linking.openURL(`tel:${phone}`)
          return
        }
      }
      Linking.openURL('tel:112')
    } catch {
      Linking.openURL('tel:112')
    }
  }

  return (
    <View style={[styles.wrapper, { paddingBottom: insets.bottom + 16 }]}>
      <TouchableOpacity style={styles.sosBtn} onPress={handleSos} activeOpacity={0.85}>
        <View style={styles.sosInner}>
          <View style={styles.iconRing}>
            <Ionicons name="call" size={22} color="white" />
          </View>

          <View style={styles.labelGroup}>
            <Text style={styles.sosTitle}>SOS</Text>
            <Text style={styles.sosSub}>Pozovi hitni kontakt</Text>
          </View>

          <Animated.View style={[styles.pulseDot, { transform: [{ scale: pulseAnim }] }]} />
        </View>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: '#f5fafa',
  },
  sosBtn: {
    backgroundColor: '#C62828',
    borderRadius: 14,
    overflow: 'hidden',
  },
  sosInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
    gap: 16,
  },
  iconRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelGroup: {
    flex: 1,
  },
  sosTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 4,
    lineHeight: 26,
  },
  sosSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
    letterSpacing: 0.3,
  },
  pulseDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
})
