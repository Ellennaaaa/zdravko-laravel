import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import Constants from 'expo-constants'
import { Platform } from 'react-native'
import { savePushToken } from '../api/pushNotifications'

export async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    alert('Push notifications work best on a real device.')
    return null
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'default',
    })
  }

  const { status: existingStatus } =
    await Notifications.getPermissionsAsync()

  let finalStatus = existingStatus

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  if (finalStatus !== 'granted') {
    alert('Notification permission was not granted.')
    return null
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ||
    Constants.easConfig?.projectId

  const token = await Notifications.getExpoPushTokenAsync({
    projectId,
  })

  console.log('EXPO PUSH TOKEN:', token.data)

  await savePushToken(token.data)

  return token.data
}