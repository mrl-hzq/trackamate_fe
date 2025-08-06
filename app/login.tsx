import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();

  const handleLogin = () => {
    // TODO: save login state
    router.replace('/(tabs)');
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20 }}>Login Page</Text>
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}
