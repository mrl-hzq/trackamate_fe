import { View, Text, TextInput, Button } from 'react-native';

export default function ExpensesScreen() {
  return (
    <View style={{ padding: 20 }}>
      <Text>Add Expense / Income</Text>
      <TextInput placeholder="Description" style={{ borderWidth: 1, marginBottom: 10 }} />
      <TextInput placeholder="Amount" keyboardType="numeric" style={{ borderWidth: 1, marginBottom: 10 }} />
      <Button title="Save" onPress={() => {}} />
    </View>
  );
}
