import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');
const NEON = '#EFFF3C';
const DARK = '#181A1B';
const GRAY = '#2A2C2E';

const reminders = [
  { icon: 'alarm', text: 'Take a quiz at 8:00 PM' },
  { icon: 'bell', text: 'Daily Quiz Reminder' },
];

const AchievementScreen = ({ navigation }: any) => {
  const performance = 0.75; // 75%
  const [reminders, setReminders] = useState([
    { icon: 'alarm', text: 'Take a quiz at 8:00 PM' },
    { icon: 'bell', text: 'Daily Quiz Reminder' },
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [newTime, setNewTime] = useState('');
  const [newLabel, setNewLabel] = useState('');

  const handleAddReminder = () => {
    if (!newTime || !newLabel) return;
    setReminders([
      ...reminders,
      { icon: 'alarm-plus', text: `${newLabel} at ${newTime}` },
    ]);
    setShowAdd(false);
    setNewTime('');
    setNewLabel('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Achievement</Text>
          <TouchableOpacity style={styles.notifBtn}>
            <Icon name="bell-outline" size={26} color={NEON} />
          </TouchableOpacity>
        </View>

        {/* Circular Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressCircleWrap}>
            <View style={styles.progressBg} />
            <View style={[styles.progressArc, { transform: [{ rotate: `${performance * 360 - 90}deg` }] }]} />
            <Text style={styles.progressText}>{Math.round(performance * 100)}%</Text>
            <Text style={styles.progressLabel}>Quiz Performance</Text>
          </View>
        </View>

        {/* Set Next Goal */}
        <View style={styles.goalSection}>
          <Text style={styles.goalTitle}>Set Your Next Goal</Text>
          <TouchableOpacity style={styles.goalBtn}>
            <Icon name="target" size={20} color={DARK} />
            <Text style={styles.goalBtnText}>Set Target</Text>
          </TouchableOpacity>
        </View>

        {/* Reminders */}
        <View style={styles.reminderSection}>
          <Text style={styles.reminderTitle}>Reminders</Text>
          {reminders.map((r, i) => (
            <View style={styles.reminderRow} key={i}>
              <Icon name={r.icon} size={20} color={NEON} style={{ marginRight: 12 }} />
              <Text style={styles.reminderText}>{r.text}</Text>
            </View>
          ))}
          {showAdd ? (
            <View style={styles.addReminderBox}>
              <TextInput
                style={styles.input}
                placeholder="Time (e.g. 8:00 PM)"
                placeholderTextColor="#888"
                value={newTime}
                onChangeText={setNewTime}
              />
              <TextInput
                style={styles.input}
                placeholder="Label (e.g. Take a quiz)"
                placeholderTextColor="#888"
                value={newLabel}
                onChangeText={setNewLabel}
              />
              <TouchableOpacity style={styles.saveBtn} onPress={handleAddReminder}>
                <Icon name="check" size={20} color={DARK} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAdd(false)}>
                <Icon name="close" size={20} color={NEON} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
              <Icon name="plus-circle" size={22} color={NEON} />
              <Text style={styles.addBtnText}>Add Reminder</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Motivation Card */}
        <View style={styles.motivationCard}>
          <Icon name="star-circle" size={28} color={DARK} style={styles.motivationIcon} />
          <Text style={styles.motivationText}>Keep going! Every quiz makes you better!</Text>
        </View>

        {/* Action Button */}
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionBtnText}>Take Quiz Now</Text>
          <Icon name="arrow-right" size={22} color={DARK} style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const CIRCLE_SIZE = 160;
const ARC_THICKNESS = 18;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: DARK,
  },
  container: {
    padding: 0,
    backgroundColor: DARK,
    alignItems: 'center',
    minHeight: '100%',
    paddingBottom: 32,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 18,
    marginBottom: 10,
  },
  headerTitle: {
    color: NEON,
    fontWeight: 'bold',
    fontSize: 24,
    letterSpacing: 1,
  },
  notifBtn: {
    backgroundColor: GRAY,
    borderRadius: 18,
    padding: 6,
  },
  progressSection: {
    marginTop: 10,
    marginBottom: 18,
    alignItems: 'center',
    width: '100%',
  },
  progressCircleWrap: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: GRAY,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 8,
  },
  progressBg: {
    position: 'absolute',
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: ARC_THICKNESS,
    borderColor: '#333',
    opacity: 0.4,
  },
  progressArc: {
    position: 'absolute',
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: ARC_THICKNESS,
    borderColor: NEON,
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
    opacity: 0.9,
  },
  progressText: {
    color: NEON,
    fontWeight: 'bold',
    fontSize: 36,
    marginBottom: 2,
  },
  progressLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    opacity: 0.7,
    marginTop: -2,
  },
  goalSection: {
    width: '90%',
    backgroundColor: GRAY,
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    marginBottom: 18,
  },
  goalTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    marginBottom: 10,
  },
  goalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NEON,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginTop: 4,
  },
  goalBtnText: {
    color: DARK,
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 8,
  },
  reminderSection: {
    width: '90%',
    marginBottom: 18,
  },
  reminderTitle: {
    color: NEON,
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GRAY,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  reminderText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  motivationCard: {
    width: '90%',
    backgroundColor: NEON,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    marginBottom: 18,
    shadowColor: NEON,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
  },
  motivationIcon: {
    marginRight: 12,
  },
  motivationText: {
    color: DARK,
    fontWeight: 'bold',
    fontSize: 15,
    flex: 1,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NEON,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 24,
  },
  actionBtnText: {
    color: DARK,
    fontWeight: 'bold',
    fontSize: 17,
    letterSpacing: 0.5,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  addBtnText: {
    color: NEON,
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 6,
  },
  addReminderBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: GRAY,
    borderRadius: 12,
    padding: 8,
  },
  input: {
    backgroundColor: DARK,
    color: NEON,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 14,
    marginRight: 8,
    minWidth: 90,
  },
  saveBtn: {
    backgroundColor: NEON,
    borderRadius: 8,
    padding: 6,
    marginRight: 6,
  },
  cancelBtn: {
    padding: 6,
  },
});

export default AchievementScreen; 