// Confirmação de ação destrutiva com o alerta do sistema. O Alert não existe na web, onde o app só roda para testes
import { Alert, Platform } from 'react-native'

export function confirm(title: string, message: string, action: string, onConfirm: () => void) {
  if (Platform.OS === 'web') return onConfirm()

  Alert.alert(title, message, [
    { text: 'Cancelar', style: 'cancel' },
    { text: action, style: 'destructive', onPress: onConfirm }
  ])
}
