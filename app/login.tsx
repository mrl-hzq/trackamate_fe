import { View, Text, TextInput, Button, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { loginUser } from './utils/api';
import { saveToken } from './utils/auth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const res = await loginUser({ email, password });
      const token = res.data.access_token;

      await saveToken(token);
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Login failed', err.response?.data?.error || 'Unknown error');
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text
        style={{
          textAlign: 'center',
          padding: 10,
          borderRadius: 5, // optional: for rounded corners
          color: '#FFFFFF'  // optional: make text white
        }}
      >Login - TRACKAMATE</Text>
      <Text
        style={{
          textAlign: 'left',
          padding: 10,
          borderRadius: 5, // optional: for rounded corners
          color: '#FFFFFF'  // optional: make text white
        }}
        >Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        style={{
          borderColor: '#FFFFFF',
          borderWidth: 1,
          padding: 10,
          borderRadius: 5, // optional: for rounded corners
          color: '#FFFFFF'  // optional: make text white
        }}
      />
      <Text
        style={{
          textAlign: 'left',
          padding: 10,
          borderRadius: 5, // optional: for rounded corners
          color: '#FFFFFF'  // optional: make text white
        }}
        >Password</Text>
      <TextInput 
        value={password} 
        onChangeText={setPassword} 
        secureTextEntry 
        style={{
          borderColor: '#FFFFFF',
          borderWidth: 1,
          padding: 10,
          borderRadius: 5, // optional: for rounded corners
          color: '#FFFFFF'  // optional: make text white
        }}
      />
      <Button title="Login" onPress={handleLogin} />
      <Button title="Register" onPress={() => router.push('/register')} />

    </View>
  );
}
