import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import dayjs from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(weekday);
dayjs.extend(isBetween);

export default function ManageSection() {
  const { section } = useLocalSearchParams<{ section: string }>();
  const router = useRouter();

  const displayNameMap: Record<string, string> = {
    'food-spending': 'Food Spending',
    'burn-money': 'Burn Money',
    'investments': 'Investments',
    'commitments': 'Commitments',
  };

  const title = displayNameMap[section] || section;

  // Form states
  const [poolAmount, setPoolAmount] = useState('');
  const [dailyRelease, setDailyRelease] = useState('');
  const [actualSpending, setActualSpending] = useState('');
  const [description, setDescription] = useState('');
  const [itemName, setItemName] = useState('');
  const [amount, setAmount] = useState('');
  const [value, setValue] = useState('');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<{ date: string; amount: number; description: string }[]>([]);

  const [spendingMap, setSpendingMap] = useState<Record<string, number>>({
    // Example mock values for testing
    '2025-08-01': 12,
    '2025-08-04': 8,
    '2025-08-05': 15,
    '2025-08-08': 15,
  });

  // CONSTANT
  const SPENDING_THRESHOLD = 10;

  const getCurrentStartDate = () => {
  const today = dayjs();
  const thisMonth25th = today.date(25);

  // If today is before the 25th, go back to the previous month’s 25th
  if (today.isBefore(thisMonth25th)) {
    return thisMonth25th.subtract(1, 'month');
  }
  return thisMonth25th;
};

  // Generate days for Food Spending range
  const foodDays = useMemo(() => {
    if (section !== 'food-spending') return [];

    const today = dayjs();
    const start = today.date() >= 25
      ? today.date(25) // 25th this month
      : today.subtract(1, 'month').date(25); // last month

    const end = start.add(1, 'month').date(24);

    let days: string[] = [];
    let current = start.clone();

    while (current.isBefore(end) || current.isSame(end, 'day')) {
      if (current.day() !== 0 && current.day() !== 6) {
        // Exclude Sunday(0) and Saturday(6)
        days.push(current.format('YYYY-MM-DD'));
      }
      current = current.add(1, 'day');
    }
    return days;
  }, [section]);

  const generateFoodCalendar = () => {
  const start = getCurrentStartDate();
  const end = start.add(1, 'month').date(24); // 24th of next month

  const days: string[] = [];
  let current = start;

  while (current.isBefore(end) || current.isSame(end, 'day')) {
    const dayOfWeek = current.day(); // 0 = Sun, 6 = Sat
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      days.push(current.format('YYYY-MM-DD'));
    }
    current = current.add(1, 'day');
  }

  // Now chunk into weeks starting Monday
  const weeks: (string | null)[][] = [];
  let week: (string | null)[] = [];

  // Fill leading empty slots for first week
  const firstWeekday = dayjs(days[0]).day(); // 1 = Mon
  for (let i = 1; i < firstWeekday; i++) {
    week.push(null);
  }

  days.forEach(date => {
    week.push(date);
    if (week.length === 5) { // Mon-Fri row full
      weeks.push(week);
      week = [];
    }
  });

  if (week.length > 0) {
    while (week.length < 5) week.push(null); // fill trailing blanks
    weeks.push(week);
  }

  return weeks;
};

const generateBurnCalendar = () => {
  const start = getCurrentStartDate();
  const end = start.add(1, 'month').date(24); // 24th of next month

  const days: string[] = [];
  let current = start;

  while (current.isBefore(end) || current.isSame(end, 'day')) {
    // Now we push every day, including Sat(6) & Sun(0)
    days.push(current.format('YYYY-MM-DD'));
    current = current.add(1, 'day');
  }

  // Chunk into weeks starting Monday (7 days)
  const weeks: (string | null)[][] = [];
  let week: (string | null)[] = [];

  // Fill leading empty slots for first week
  const firstWeekday = dayjs(days[0]).day(); // 0=Sun, 1=Mon
  const offset = (firstWeekday + 6) % 7; // convert so Monday=0
  for (let i = 0; i < offset; i++) {
    week.push(null);
  }

  days.forEach(date => {
    week.push(date);
    if (week.length === 7) { // Full week
      weeks.push(week);
      week = [];
    }
  });

  if (week.length > 0) {
    while (week.length < 7) week.push(null); // fill trailing blanks
    weeks.push(week);
  }

  return weeks;
};


const foodCalendarRows = useMemo(() => generateFoodCalendar(), []);
const burnCalendarRows = useMemo(() => generateBurnCalendar(), []);

const handleAddFood = () => {
  if (!selectedDate || !amount.trim()) return;

  const numericAmount = parseFloat(amount);

  // Update expenses list
  setExpenses(prev => [
    ...prev,
    { date: selectedDate, amount: numericAmount, description }
  ]);

  // Update spendingMap totals
  setSpendingMap(prev => {
    const updated = { ...prev };
    updated[selectedDate] = (updated[selectedDate] || 0) + numericAmount;
    return updated;
  });

  // Clear input fields
  setAmount('');
  setDescription('');
};

const BURN_POOL = 500;
const DAILY_RELEASE = 10;

const getBurnStats = () => {
  const start = getCurrentStartDate();
  const end = start.add(1, 'month').date(24);

  // Count days in cycle
  let daysCount = 0;
  let current = start.clone();
  while (current.isBefore(end) || current.isSame(end, 'day')) {
    daysCount++;
    current = current.add(1, 'day');
  }

  const reservedAmount = daysCount * DAILY_RELEASE;
  const instantPool = BURN_POOL - reservedAmount;

  const today = dayjs();
  const daysPassed = today.diff(start, 'day') + 1;

  const availableToday = Math.max(0, instantPool + (daysPassed * DAILY_RELEASE));

  return {
    pool: BURN_POOL,
    availableToday,
    daysCount,
    daysPassed,
    start,
    end
  };
};
const burnStats = getBurnStats();

const ProgressBar = ({ progress }: { progress: number }) => (
  <View style={{ height: 8, backgroundColor: '#334155', borderRadius: 4, overflow: 'hidden' }}>
    <View
      style={{
        width: `${Math.min(progress, 100)}%`,
        height: '100%',
        backgroundColor: '#22c55e'
      }}
    />
  </View>
);


  const renderForm = () => {
    switch (section) {
      case 'food-spending':
        return (
          <>
            {/* Header row */}
            <View style={styles.weekHeader}>
              {['M', 'T', 'W', 'T', 'F'].map((d) => (
                <Text key={d} style={styles.weekHeaderText}>{d}</Text>
              ))}
            </View>

            {foodCalendarRows.map((week, i) => (
              <View key={i} style={styles.calendarRow}>
                {week.map((day, idx) => {
                  if (!day) {
                    return <View key={idx} style={[styles.calendarDay, { backgroundColor: 'transparent' }]} />;
                  }
                  const spend = spendingMap[day] ?? null;
                  const isSelected = selectedDate === day;
                  let bgColor = '#475569';

                  if (spend !== null) {
                    bgColor = spend > SPENDING_THRESHOLD ? '#ef4444' : '#22c55e';
                  }

                  return (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.calendarDay,
                        { backgroundColor: bgColor },
                        isSelected && styles.selectedDayBorder
                      ]}
                      onPress={() => setSelectedDate(day)}
                    >
                      <Text style={styles.calendarDayText}>
                        {dayjs(day).format('D')}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}

            
          {selectedDate && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Add Spending for {dayjs(selectedDate).format('DD MMM YYYY')}</Text>
              <TextInput
                style={styles.input}
                placeholder="Amount (RM)"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
              <TextInput
                style={styles.input}
                placeholder="Description"
                placeholderTextColor="#94a3b8"
                value={description}
                onChangeText={setDescription}
              />
              <TouchableOpacity style={styles.addButton} onPress={handleAddFood}>
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={[styles.label, { marginTop: 20 }]}>Spending List</Text>
          <FlatList
            data={expenses}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.expenseRow}>
                <Text style={styles.expenseDate}>{dayjs(item.date).format('DD/MM')}</Text>
                <Text style={[styles.expenseAmount, { color: item.amount > 10 ? '#ef4444' : '#22c55e' }]}>
                  RM {item.amount.toFixed(2)}
                </Text>
                <Text style={styles.expenseDesc}>{item.description}</Text>
              </View>
            )}
          />
        </>
      );

      case 'burn-money':
        return (
          <>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
            {/* Card 1 */}
            <View style={{ flex: 1, backgroundColor: '#1e293b', padding: 16, borderRadius: 12 }}>
              <Text style={{ fontSize: 16, color: '#94a3b8' }}>Pool</Text>
              <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#fff' }}>
                RM {burnStats.pool}
              </Text>

              <Text style={{ fontSize: 16, color: '#94a3b8', marginTop: 8 }}>Available Today</Text>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#fff' }}>
                RM {burnStats.availableToday}
              </Text>

              <View style={{ marginTop: 10 }}>
                <ProgressBar progress={(burnStats.availableToday / burnStats.pool) * 100} />
              </View>
            </View>

            {/* Card 2 */}
            <View style={{ flex: 1, backgroundColor: '#1e293b', padding: 16, borderRadius: 12 }}>
              <Text style={{ fontSize: 16, color: '#94a3b8' }}>Cycle</Text>
              <Text style={{ fontSize: 16, color: '#fff' }}>
                {burnStats.start.format('DD MMM')} - {burnStats.end.format('DD MMM')}
              </Text>

              <View style={{ marginTop: 10 }}>
                <ProgressBar progress={(burnStats.daysPassed / burnStats.daysCount) * 100} />
              </View>
            </View>
          </View>
            {/* Header row */}
            <View style={styles.weekHeader}>
              {['S','M', 'T', 'W', 'T', 'F','S'].map((d) => (
                <Text key={d} style={styles.weekHeaderTextBurn}>{d}</Text>
              ))}
            </View>

            {burnCalendarRows.map((week, i) => (
              <View key={i} style={styles.calendarBurnRow}>
                {week.map((day, idx) => {
                  if (!day) {
                    return <View key={idx} style={[styles.calendarBurnDay, { backgroundColor: 'transparent' }]} />;
                  }
                  const spend = spendingMap[day] ?? null;
                  const isSelected = selectedDate === day;
                  let bgColor = '#475569';

                  if (spend !== null) {
                    bgColor = spend > SPENDING_THRESHOLD ? '#ef4444' : '#22c55e';
                  }

                  return (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.calendarBurnDay,
                        { backgroundColor: bgColor },
                        isSelected && styles.selectedDayBorder
                      ]}
                      onPress={() => setSelectedDate(day)}
                    >
                      <Text style={styles.calendarDayText}>
                        {dayjs(day).format('D')}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}

            
          {selectedDate && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Add Spending for {dayjs(selectedDate).format('DD MMM YYYY')}</Text>
              <TextInput
                style={styles.input}
                placeholder="Amount (RM)"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
              <TextInput
                style={styles.input}
                placeholder="Description"
                placeholderTextColor="#94a3b8"
                value={description}
                onChangeText={setDescription}
              />
              <TouchableOpacity style={styles.addButton} onPress={handleAddFood}>
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={[styles.label, { marginTop: 20 }]}>Spending List</Text>
          <FlatList
            data={expenses}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.expenseRow}>
                <Text style={styles.expenseDate}>{dayjs(item.date).format('DD/MM')}</Text>
                <Text style={[styles.expenseAmount, { color: item.amount > 10 ? '#ef4444' : '#22c55e' }]}>
                  RM {item.amount.toFixed(2)}
                </Text>
                <Text style={styles.expenseDesc}>{item.description}</Text>
              </View>
            )}
          />
        </>
      );
      case 'investments':
      case 'commitments':
        return (
          <>
            <Text style={styles.label}>{section === 'investments' ? 'Investment Name' : 'Commitment Name'}</Text>
            <TextInput
              style={styles.input}
              value={itemName}
              onChangeText={setItemName}
              placeholder="Enter name"
              placeholderTextColor="#94a3b8"
            />
            <Text style={styles.label}>Amount (RM)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              placeholder="Enter amount"
              placeholderTextColor="#94a3b8"
            />
            <Text style={styles.label}>Value (%)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={value}
              onChangeText={setValue}
              placeholder="Enter value"
              placeholderTextColor="#94a3b8"
            />
          </>
        );
      default:
        return <Text>No form available</Text>;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.push('/finance')}>
        <Text style={styles.backText}>⬅ Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Manage {title}</Text>

      <View style={styles.card}>{renderForm()}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // food
  container: { flex: 1, backgroundColor: '#1e293b', padding: 16 },
  backBtn: { marginBottom: 12 },
  backText: { color: '#82ca9d', fontSize: 16 },
  title: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  card: { backgroundColor: '#334155', padding: 16, borderRadius: 8 },
  label: { color: '#fff', marginTop: 12 },
  input: {
    backgroundColor: '#475569',
    color: '#fff',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 4,
  },
  dayText: { color: '#94a3b8', fontSize: 14 },
  calendarGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  marginTop: 8,
  },
  selectedDay: {
    backgroundColor: '#82ca9d',
  },
  weekHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  paddingHorizontal: 4,
},
weekHeaderText: {
  color: '#fff',
  textAlign: 'center',
  width: '18%', // fit 5 days in row
  fontWeight: 'bold',
},
calendarRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginVertical: 4,
},
calendarDay: {
  width: '18%',
  aspectRatio: 1,
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 4,
},
selectedDayBorder: {
  borderWidth: 2,
  borderColor: '#facc15', // yellow border for selection
},
calendarDayText: {
  color: '#fff',
  fontSize: 14,
  fontWeight: 'bold',
},

emptyBox: { backgroundColor: 'transparent', borderWidth: 0 },
inputContainer: { marginTop: 12 },
inputLabel: { color: '#fff', marginBottom: 4 },
addButton: { backgroundColor: '#82ca9d', padding: 10, borderRadius: 6, alignItems: 'center' },
addButtonText: { color: '#000', fontWeight: 'bold' },
expenseRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#475569' },
expenseDate: { color: '#94a3b8', width: 50 },
expenseAmount: { fontWeight: 'bold', width: 80, textAlign: 'right' },
expenseDesc: { color: '#fff', flex: 1, marginLeft: 10 },
// food
// burn
weekHeaderTextBurn: {
  color: '#fff',
  textAlign: 'center',
  width: '12.8%', // fit 7 days in row
  fontWeight: 'bold',
},
calendarBurnRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginVertical: 4,
},
calendarBurnDay: {
  width: '12.8%',
  aspectRatio: 1,
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 4,
},
// burn
});
