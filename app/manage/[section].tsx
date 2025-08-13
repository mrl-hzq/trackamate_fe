import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, FlatList, Switch } from 'react-native';
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
  const getCurrentStartDate = () => {
  const today = dayjs();
  const thisMonth25th = today.date(25);

  // If today is before the 25th, go back to the previous month’s 25th
  if (today.isBefore(thisMonth25th)) {
    return thisMonth25th.subtract(1, 'month');
  }
  return thisMonth25th;
  };

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
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//FOOD SPENDING START

const [expensesFood, setExpensesFood] = useState<{ date: string; amount: number; descriptionFood: string }[]>([]);
const [selectedDateFood, setSelectedDateFood] = useState<string | null>(null);
const DAILY_FOOD = 10;
const FOOD_SPENDING_THRESHOLD = 10;
const [descriptionFood, setDescriptionFood] = useState('');
const [priceFood, setPriceFood] = useState('');

const getFoodStats = (expenses: { date: string; amount: number }[]) => {
  const start = getCurrentStartDate();
  const end = start.add(1, 'month').date(24);

  // Count only weekdays in the cycle
  const foodDaysList: string[] = [];
  let current = start.clone();
  while (current.isBefore(end) || current.isSame(end, 'day')) {
    if (current.day() !== 0 && current.day() !== 6) { // Mon–Fri
      foodDaysList.push(current.format('YYYY-MM-DD'));
    }
    current = current.add(1, 'day');
  }

  const pool = foodDaysList.length * DAILY_FOOD;

  // Calculate carry-over balance day by day
  let carryOver = 0;
  const today = dayjs();
  for (let dateStr of foodDaysList) {
    if (dayjs(dateStr).isAfter(today, 'day')) break; // stop after today

    const spentToday = expenses
      .filter(e => e.date === dateStr)
      .reduce((sum, e) => sum + e.amount, 0);

    carryOver += DAILY_FOOD - spentToday;
  }

  // Available today = carryOver after today's spending so far
  const availableToday = carryOver;

  return {
    pool,
    availableToday,
    start,
    end,
    daysCount: foodDaysList.length,
    daysPassed: foodDaysList.filter(d => !dayjs(d).isAfter(today, 'day')).length
  };
};

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

const handleAddFood = () => {
  if (!selectedDateFood || !priceFood.trim()) return;

  const numericAmount = parseFloat(priceFood);

  // Update expenses list
  setExpensesFood(prev => [
    ...prev,
    { date: selectedDateFood, amount: numericAmount, descriptionFood}
  ]);

  // Update spendingMap totals
  setSpendingMap(prev => {
    const updated = { ...prev };
    updated[selectedDateFood] = (updated[selectedDateFood] || 0) + numericAmount;
    return updated;
  });

  // Clear input fields
  setPriceFood('');
  setDescriptionFood('');
};

const foodStats = getFoodStats(expensesFood);
const foodCalendarRows = useMemo(() => generateFoodCalendar(), []);

//FOOD SPENDING END
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//BURN MONEY START
const BURN_SPENDING_THRESHOLD = 10;
const BURN_POOL = 500;
const DAILY_RELEASE = 10;

const [expensesBurn, setExpensesBurn] = useState<{ date: string; amount: number; descriptionBurn: string }[]>([]);
const [descriptionBurn, setDescriptionBurn] = useState('');
const [priceBurn, setPriceBurn] = useState('');
const [selectedDateBurn, setSelectedDateBurn] = useState<string | null>(null);
const [spendingMap, setSpendingMap] = useState<Record<string, number>>({
  // Example mock values for testing
  '2025-08-01': 12,
  '2025-08-04': 8,
  '2025-08-05': 15,
  '2025-08-08': 15,
});

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

const handleAddBurn = () => {
  if (!selectedDateBurn || !priceBurn.trim()) return;

  const numericAmount = parseFloat(priceBurn);

  // Update expenses list
  setExpensesBurn(prev => [
    ...prev,
    { date: selectedDateBurn, amount: numericAmount, descriptionBurn}
  ]);

  // Update spendingMap totals
  setSpendingMap(prev => {
    const updated = { ...prev };
    updated[selectedDateBurn] = (updated[selectedDateBurn] || 0) + numericAmount;
    return updated;
  });

  // Clear input fields
  setPriceBurn('');
  setDescriptionBurn('');
};

const burnCalendarRows = useMemo(() => generateBurnCalendar(), []);
const burnStats = getBurnStats();

//BURN MONEY END
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Investment start

const MONTHLY_INVEST = 1000; // hardcoded budget
const [itemNameInvest, setItemNameInvest] = useState('');
const [amountInvest, setAmountInvest] = useState('');
type Investment = {
  id: string;
  name: string;
  amount: number;
  isDone: boolean;
};
const [Investments, setInvestments] = useState<Investment[]>([
  { id: '1', name: 'Mutual Fund', amount: 300, isDone: true },
  { id: '2', name: 'Crypto DCA', amount: 200, isDone: false },
  { id: '3', name: 'Stock Purchase', amount: 500, isDone: false },
]);

const handleAddInvest = () => {
  if (!itemNameInvest.trim() || !amountInvest.trim()) return;

  const newInvestment: Investment = {
    id: Date.now().toString(),
    name: itemNameInvest,
    amount: parseFloat(amountInvest),
    isDone: false,
  };

  setInvestments(prev => [...prev, newInvestment]);
  setItemNameInvest('');
  setAmountInvest('');
};

const toggleIsDoneInvest = (id: string) => {
  setInvestments(prev =>
    prev.map(item =>
      item.id === id ? { ...item, isDone: !item.isDone } : item
    )
  );
};

//Investment END
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Commitment start

const MONTHLY_COMMIT = 1000; // hardcoded budget
const [itemNameCommit, setItemNameCommit] = useState('');
const [amountCommit, setAmountCommit] = useState('');
const [recurringCommit, setRecurringCommit] = useState(false);
type Commitment = {
  id: string;
  name: string;
  amount: number;
  recurringCommit: boolean;
  isDone: boolean;
};
const [commitments, setCommitments] = useState<Commitment[]>([
  { id: '1', name: 'Mutual Fund', amount: 300, recurringCommit: true, isDone: true },
  { id: '2', name: 'Crypto DCA', amount: 200, recurringCommit: true, isDone: false },
  { id: '3', name: 'Stock Purchase', amount: 500, recurringCommit: false, isDone: false },
]);

const handleAddCommit = () => {
  if (!itemNameCommit.trim() || !amountCommit.trim()) return;

  const newCommitment: Commitment = {
    id: Date.now().toString(),
    name: itemNameCommit,
    amount: parseFloat(amountCommit),
    recurringCommit,
    isDone: false,
  };

  setCommitments(prev => [...prev, newCommitment]);
  setItemNameCommit('');
  setAmountCommit('');
  setRecurringCommit(false);
};

const toggleIsDone = (id: string) => {
  setCommitments(prev =>
    prev.map(item =>
      item.id === id ? { ...item, isDone: !item.isDone } : item
    )
  );
};
//Commitment End
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const renderForm = () => {
    switch (section) {
      case 'food-spending':
        return (
          <>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
              {/* Card 1 */}
              <View style={{ flex: 1, backgroundColor: '#1e293b', padding: 16, borderRadius: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 16, color: '#94a3b8' }}>Pool</Text>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#fff' }}>RM {foodStats.pool}</Text>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                  <Text style={{ fontSize: 16, color: '#94a3b8' }}>Available Today</Text>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: foodStats.availableToday < 0 ? '#ef4444' : '#fff' }}>
                    {foodStats.availableToday < 0 ? `- RM ${Math.abs(foodStats.availableToday)}` : `RM ${foodStats.availableToday}`}
                  </Text>
                </View>

                <View style={{ marginTop: 10 }}>
                  <ProgressBar progress={(Math.max(foodStats.pool - (foodStats.pool - foodStats.availableToday), 0) / foodStats.pool) * 100} />
                </View>
              </View>
            </View>

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
                  const isSelected = selectedDateFood === day;
                  let bgColor = '#475569';

                  if (spend !== null) {
                    bgColor = spend > FOOD_SPENDING_THRESHOLD ? '#ef4444' : '#22c55e';
                  }

                  return (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.calendarDay,
                        { backgroundColor: bgColor },
                        isSelected && styles.selectedDayBorder
                      ]}
                      onPress={() => setSelectedDateFood(day)}
                    >
                      <Text style={styles.calendarDayText}>
                        {dayjs(day).format('D')}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}

            
          {selectedDateFood && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Add Spending for {dayjs(selectedDateFood).format('DD MMM YYYY')}</Text>
              <TextInput
                style={styles.input}
                placeholder="Amount (RM)"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
                value={priceFood}
                onChangeText={setPriceFood}
              />
              <TextInput
                style={styles.input}
                placeholder="Description"
                placeholderTextColor="#94a3b8"
                value={descriptionFood}
                onChangeText={setDescriptionFood}
              />
              <TouchableOpacity style={styles.addButtonTop} onPress={handleAddFood}>
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={[styles.label, { marginTop: 20 }]}>Spending List</Text>
          <FlatList
            data={expensesFood}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.expenseRow}>
                <Text style={styles.expenseDate}>{dayjs(item.date).format('DD/MM')}</Text>
                <Text style={[styles.expenseAmount, { color: item.amount > 10 ? '#ef4444' : '#22c55e' }]}>
                  RM {item.amount.toFixed(2)}
                </Text>
                <Text style={styles.expenseDesc}>{item.descriptionFood}</Text>
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
              <Text style={{ fontSize: 16, color: '#94a3b8' }}>Pool RM {burnStats.pool}</Text>

              <Text style={{ fontSize: 16, color: '#fff'}}>Available Today RM {burnStats.availableToday}</Text>
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
                  const isSelected = selectedDateBurn === day;
                  let bgColor = '#475569';

                  if (spend !== null) {
                    bgColor = spend > BURN_SPENDING_THRESHOLD ? '#ef4444' : '#22c55e';
                  }

                  return (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.calendarBurnDay,
                        { backgroundColor: bgColor },
                        isSelected && styles.selectedDayBorder
                      ]}
                      onPress={() => setSelectedDateBurn(day)}
                    >
                      <Text style={styles.calendarDayText}>
                        {dayjs(day).format('D')}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}

            
          {selectedDateBurn && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Add Spending for {dayjs(selectedDateBurn).format('DD MMM YYYY')}</Text>
              <TextInput
                style={styles.input}
                placeholder="Amount (RM)"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
                value={priceBurn}
                onChangeText={setPriceBurn}
              />
              <TextInput
                style={styles.input}
                placeholder="Description"
                placeholderTextColor="#94a3b8"
                value={descriptionBurn}
                onChangeText={setDescriptionBurn}
              />
              <TouchableOpacity style={styles.addButtonTop} onPress={handleAddBurn}>
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={[styles.label, { marginTop: 20 }]}>Spending List</Text>
          <FlatList
            data={expensesBurn}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.expenseRow}>
                <Text style={styles.expenseDate}>{dayjs(item.date).format('DD/MM')}</Text>
                <Text style={[styles.expenseAmount, { color: item.amount > 10 ? '#ef4444' : '#22c55e' }]}>
                  RM {item.amount.toFixed(2)}
                </Text>
                <Text style={styles.expenseDesc}>{item.descriptionBurn}</Text>
              </View>
            )}
          />
        </>
      );
      case 'investments':
        return (
            <View>
              <Text style={styles.budget}>Monthly Investment Budget: RM {MONTHLY_INVEST}</Text>

              {/* Input Fields */}
              <Text style={styles.label}>Investment Name</Text>
              <TextInput
                style={styles.input}
                value={itemNameInvest}
                onChangeText={setItemNameInvest}
                placeholder="Enter name"
                placeholderTextColor="#94a3b8"
              />

              <Text style={styles.label}>Amount (RM)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={amountInvest}
                onChangeText={setAmountInvest}
                placeholder="Enter amount"
                placeholderTextColor="#94a3b8"
              />

              <TouchableOpacity style={styles.addButtonTop} onPress={handleAddInvest}>
                <Text style={styles.addButtonText}>Add Investment</Text>
              </TouchableOpacity>

              {/* List of Commitments */}
              <FlatList
                style={{ marginTop: 20 }}
                data={Investments}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <View
                    style={[
                      styles.commitmentRow,
                      !item.isDone && { backgroundColor: 'rgba(239,68,68,0.2)' }
                    ]}
                  >
                    <View>
                      <Text style={styles.commitmentName}>{item.name}</Text>
                      <Text style={styles.commitmentAmount}>RM {item.amount}</Text>
                    </View>
                    <Switch
                      value={item.isDone}
                      onValueChange={() => toggleIsDoneInvest(item.id)}
                      trackColor={{ false: '#64748b', true: '#22c55e' }}
                    />
                  </View>
                )}
              />
            </View>
        );
      case 'commitments':
        return (
            <View>
              <Text style={styles.budget}>Monthly Commitment Budget: RM {MONTHLY_COMMIT}</Text>

              {/* Input Fields */}
              <Text style={styles.label}>Commitment Name</Text>
              <TextInput
                style={styles.input}
                value={itemNameCommit}
                onChangeText={setItemNameCommit}
                placeholder="Enter name"
                placeholderTextColor="#94a3b8"
              />

              <Text style={styles.label}>Amount (RM)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={amountCommit}
                onChangeText={setAmountCommit}
                placeholder="Enter amount"
                placeholderTextColor="#94a3b8"
              />

              <View style={styles.row}>
                <Text style={styles.label}>Recurring?</Text>
                <Switch
                  value={recurringCommit}
                  onValueChange={setRecurringCommit}
                  trackColor={{ false: '#64748b', true: '#22c55e' }}
                />
              </View>

              <TouchableOpacity style={styles.addButton} onPress={handleAddCommit}>
                <Text style={styles.addButtonText}>Add Commitment</Text>
              </TouchableOpacity>

              {/* List of Commitments */}
              <FlatList
                style={{ marginTop: 20 }}
                data={commitments}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <View
                    style={[
                      styles.commitmentRow,
                      !item.isDone && { backgroundColor: 'rgba(239,68,68,0.2)' }
                    ]}
                  >
                    <View>
                      <Text style={styles.commitmentName}>{item.name}</Text>
                      <Text style={styles.commitmentAmount}>RM {item.amount}</Text>
                    </View>
                    <Switch
                      value={item.isDone}
                      onValueChange={() => toggleIsDone(item.id)}
                      trackColor={{ false: '#64748b', true: '#22c55e' }}
                    />
                  </View>
                )}
              />
            </View>
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
  addButton: { backgroundColor: '#82ca9d', padding: 10, borderRadius: 6, alignItems: 'center'},
  addButtonTop: { backgroundColor: '#82ca9d', padding: 10, borderRadius: 6, alignItems: 'center', marginTop: 15},
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
  //Commit start

  // container: {
  //   padding: 16,
  //   backgroundColor: '#0f172a',
  //   flex: 1,
  // },
  budget: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f1f5f9',
    marginBottom: 16,
  },
  // label: {
  //   color: '#94a3b8',
  //   fontSize: 14,
  //   marginBottom: 4,
  // },
  // input: {
  //   backgroundColor: '#1e293b',
  //   color: '#fff',
  //   padding: 10,
  //   borderRadius: 8,
  //   marginBottom: 12,
  // },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  // addButton: {
  //   backgroundColor: '#2563eb',
  //   padding: 12,
  //   borderRadius: 8,
  //   alignItems: 'center',
  // },
  // addButtonText: {
  //   color: '#fff',
  //   fontWeight: 'bold',
  // },
  commitmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#1e293b',
    borderRadius: 8,
    marginBottom: 10,
  },
  commitmentName: {
    color: '#fff',
    fontSize: 16,
  },
  commitmentAmount: {
    color: '#94a3b8',
    fontSize: 14,
  }
//Commit End 
});
