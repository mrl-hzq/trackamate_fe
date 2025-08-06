import { View, Text, TextInput, Button } from 'react-native';

export default function MealsScreen() {
  return (
    <View style={{ padding: 20 }}>
      <Text>Meal Logging</Text>
      <TextInput placeholder="Meal Name" style={{ borderWidth: 1, marginBottom: 10 }} />
      <TextInput placeholder="Calories" keyboardType="numeric" style={{ borderWidth: 1, marginBottom: 10 }} />
      <Button title="Add Meal" onPress={() => {}} />
    </View>
  );
}
