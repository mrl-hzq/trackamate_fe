import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
// import DashboardScreen from '../components/DashboardScreen';
import PageWrapper from './PageWrapper';

// Dummy finance data
const financeData = {
  weekly: { income: 500, expenses: 350 },
  monthly: { income: 2000, expenses: 1500 },
};

// Dummy nutrition data
const nutritionData = [
  { name: 'Protein', value: 40, color: '#4ade80' },
  { name: 'Carbs', value: 35, color: '#facc15' },
  { name: 'Fats', value: 25, color: '#f87171' },
];

// Dummy goals
const goals = [
  { name: 'Save $5000', progress: 65 },
  { name: 'Run 50km', progress: 40 },
  { name: 'Lose 5kg', progress: 80 },
];

export default function DashboardScreen() {
  return (
    <PageWrapper>
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Finance Summary */}
      <Text style={styles.sectionTitle}>Finance Summary</Text>
      <View style={styles.cardRow}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Weekly</Text>
          <Text style={styles.income}>Income: ${financeData.weekly.income}</Text>
          <Text style={styles.expense}>Expenses: ${financeData.weekly.expenses}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Monthly</Text>
          <Text style={styles.income}>Income: ${financeData.monthly.income}</Text>
          <Text style={styles.expense}>Expenses: ${financeData.monthly.expenses}</Text>
        </View>
      </View>

      {/* Nutrition Chart */}
      <Text style={styles.sectionTitle}>Nutrition</Text>
      <View style={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={nutritionData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="value"
              label
            >
              {nutritionData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </View>

      {/* Goals */}
      <Text style={styles.sectionTitle}>Goals</Text>
      {goals.map((goal, idx) => (
        <View key={idx} style={styles.goalContainer}>
          <Text style={styles.goalText}>{goal.name}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${goal.progress}%` }]} />
          </View>
          <Text style={styles.goalPercent}>{goal.progress}%</Text>
        </View>
      ))}
    </ScrollView>
    </PageWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1e293b',
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 10,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 10,
  },
  card: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  cardTitle: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 5,
  },
  income: {
    fontSize: 14,
    color: '#4ade80',
  },
  expense: {
    fontSize: 14,
    color: '#f87171',
  },
  chartWrapper: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 10,
    marginTop: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  goalContainer: {
    marginVertical: 8,
  },
  goalText: {
    color: '#fff',
    marginBottom: 5,
  },
  progressBar: {
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4ade80',
  },
  goalPercent: {
    color: '#fff',
    fontSize: 12,
    marginTop: 3,
  },
});
