import { View, Text, TextInput, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
  const router = useRouter();

  return (
    <View style={{ padding: 20 }}>
      <Text>Email</Text>
      <TextInput style={{ borderWidth: 1, marginBottom: 10 }} />
      <Text>Password</Text>
      <TextInput secureTextEntry style={{ borderWidth: 1, marginBottom: 20 }} />
      <Button title="Register" onPress={() => router.replace('/')} />
    </View>
  );
}
