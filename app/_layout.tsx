import { Slot, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';

// Mocked auth (replace this with AsyncStorage or Firebase)
const isUserLoggedIn = async () => {
  // TODO: replace with real logic
  return false; // 👈 change to true to simulate being logged in
};

export default function RootLayout() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const loggedIn = await isUserLoggedIn();
      setAuthenticated(loggedIn);
      setLoading(false);

      if (!loggedIn) {
        router.replace('/login'); // 👈 redirect to login if not logged in
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Slot />; // 👈 render current route (login or tabs)
}
