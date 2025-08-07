import { View, Text, TextInput, Button, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { registerUser } from '../src/utils/api';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleRegister = async () => {
    try {
      await registerUser({ name, email, password });
      Alert.alert('Account created. Please login');
      router.replace('/login');
    } catch (err: any) {
      Alert.alert('Registration failed', err.response?.data?.error || 'Unknown error');
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ textAlign: 'center', padding: 10, color: '#FFFFFF' }}>
        Register - TRACKAMATE
      </Text>

      <Text style={{ padding: 10, color: '#FFFFFF' }}>Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        style={{
          borderColor: '#FFFFFF',
          borderWidth: 1,
          padding: 10,
          borderRadius: 5,
          color: '#FFFFFF',
        }}
      />

      <Text style={{ padding: 10, color: '#FFFFFF' }}>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        style={{
          borderColor: '#FFFFFF',
          borderWidth: 1,
          padding: 10,
          borderRadius: 5,
          color: '#FFFFFF',
        }}
      />

      <Text style={{ padding: 10, color: '#FFFFFF' }}>Password</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{
          borderColor: '#FFFFFF',
          borderWidth: 1,
          padding: 10,
          borderRadius: 5,
          color: '#FFFFFF',
        }}
      />

      <Button title="Register" onPress={handleRegister} />
      <Button title="Login" onPress={() => router.push('/login')} />
    </View>
  );
}
