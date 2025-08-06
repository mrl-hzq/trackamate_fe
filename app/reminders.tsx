import { View, Text, Button } from 'react-native';

export default function RemindersScreen() {
  return (
    <View style={{ padding: 20 }}>
      <Text>🔔 Setup Reminders</Text>
      <Button title="Set Reminder (Fake)" onPress={() => alert("Reminder Set!")} />
    </View>
  );
}
