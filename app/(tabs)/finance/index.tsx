import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import PageWrapper from '../PageWrapper';

function generateWeekdaysOfMonth() {
  const today = dayjs();
  const start = today.startOf('month');
  const end = today.endOf('month');
  let days: { day: number, spend: number }[] = [];

  for (let d = start; d.isBefore(end) || d.isSame(end, 'day'); d = d.add(1, 'day')) {
    const weekday = d.day(); // 0=Sun, 6=Sat
    if (weekday !== 0 && weekday !== 6) {
      days.push({
        day: d.date(),
        spend: Math.floor(Math.random() * 15) + 5,
      });
    }
  }
  return days;
}

export default function FinanceDashboard() {
  const router = useRouter();

  const foodData = useMemo(() => generateWeekdaysOfMonth(), []);

  // Burn Money System
  const pool = 300;
  const dailyRelease = 10;
  const startDate = dayjs().startOf('month');
  const today = dayjs();
  const daysSinceStart = today.diff(startDate, 'day') + 1;
  const spentSoFar = 20;
  const available = Math.min(pool, dailyRelease * daysSinceStart - spentSoFar);
  const poolUsedPercent = (spentSoFar / pool) * 100;

  const investmentData = [
    { name: 'Stocks', value: 50 },
    { name: 'Crypto', value: 30 },
    { name: 'Real Estate', value: 20 },
  ];

  const commitmentData = [
    { name: 'Rent', value: 40 },
    { name: 'Loans', value: 35 },
    { name: 'Subscriptions', value: 25 },
  ];

  const colors = ['#82ca9d', '#8884d8', '#f87171'];

  type ChartHeaderProps = {
  title: string;
  section: string;
};

const ChartHeader: React.FC<ChartHeaderProps> = ({ title, section }) => (
  <View style={styles.headerRow}>
    <Text style={styles.cardTitle}>{title}</Text>
    <TouchableOpacity
      onPress={() => router.push(`/manage/${section}` as any)} // cast to any to bypass strict path typing
    >
      <Ionicons name="settings-outline" size={20} color="#fff" />
    </TouchableOpacity>
  </View>
);

  return (
  
  <PageWrapper>
    <ScrollView style={styles.container}>

      {/* Food Spending */}
      <View style={styles.card}>
        <ChartHeader title="🍜 Food Spending (Weekdays Only)" section="food-spending" />
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={foodData}>
            <XAxis dataKey="day" tick={{ fill: '#fff' }} />
            <YAxis label={{ value: "RM", angle: -90, position: "insideLeft" }} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569' }} />
            <Line
              type="monotone"
              dataKey="spend"
              stroke="#82ca9d"
              strokeWidth={2}
              dot={{ r: 5, strokeWidth: 2, fill: '#1e293b', stroke: '#82ca9d' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </View>

      {/* Burn Money */}
      <View style={styles.card}>
        <ChartHeader title="🔥 Burn Money" section="burn-money" />
        <Text style={styles.burnAvailable}>Available Today: RM {available}</Text>
        <Text style={styles.burnSub}>Pool: RM {pool} | Daily: RM {dailyRelease}</Text>
        <Text style={styles.burnSub}>Used: RM {spentSoFar} ({poolUsedPercent.toFixed(1)}%)</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${poolUsedPercent}%` }]} />
        </View>
      </View>

      {/* Investment */}
      <View style={styles.card}>
        <ChartHeader title="📈 Investments" section="investments" />
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={investmentData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {investmentData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </View>

      {/* Commitment */}
      <View style={styles.card}>
        <ChartHeader title="📌 Commitments" section="commitments" />
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={commitmentData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {commitmentData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </View>

    </ScrollView>
  </PageWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#1e293b' },
  card: { backgroundColor: '#334155', padding: 15, borderRadius: 12, marginBottom: 15 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardTitle: { color: '#fff', fontSize: 18 },
  burnAvailable: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  burnSub: { color: '#94a3b8', fontSize: 14 },
  progressBar: { height: 8, backgroundColor: '#475569', borderRadius: 4, marginTop: 5, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#f87171' },
});
