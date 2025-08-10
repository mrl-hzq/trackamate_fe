import { View, Text, TextInput, Button, Alert, StyleSheet, Platform } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { loginUser } from '../src/utils/api';
import { saveToken } from '../src/utils/auth';
// import { BlurView } from 'expo-blur';
// import { LinearGradient } from 'expo-linear-gradient';

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
    <View style={styles.container}>
      <View style={styles.glassCard}>
        <Text style={styles.title}>TRACKAMATE</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor="rgba(255,255,255,0.6)"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          placeholder="Enter your password"
          placeholderTextColor="rgba(255,255,255,0.6)"
        />

        <View style={styles.buttonWrapper}>
          <View style={styles.button}>
            <Button
              title="Login"
              onPress={handleLogin}
              color={Platform.OS === 'ios' ? '#000' : '#1e293b'}
            />
          </View>
          <View style={styles.button}>
            <Button
              title="Register"
              onPress={() => router.push('/register')}
              color={Platform.OS === 'ios' ? '#000' : '#334155'}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  padding: 20,
  },
  glassCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 1.5,
  },
  label: {
    fontSize: 14,
    color: '#fff',
    marginTop: 10,
    marginBottom: 5,
  },
  input: {
    borderColor: 'rgba(255,255,255,0.3)',
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    color: '#fff',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  buttonWrapper: {
    marginTop: 20,
    gap: 10,
  },
  button: {
    borderRadius: 10,
    overflow: 'hidden',
  },
});
