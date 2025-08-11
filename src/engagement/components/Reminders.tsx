import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const NEON = '#EFFF3C';
const DARK = '#181A1B';
const GRAY = '#2A2C2E';

const Reminders = () => {
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
    <View style={styles.reminderSection}>
      <Text style={styles.reminderTitle}>Reminders</Text>
      {reminders.map((r, i) => (
        <View style={styles.reminderRow} key={i}>
          <Icon
            name={r.icon}
            size={20}
            color={NEON}
            style={{ marginRight: 12 }}
          />
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
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleAddReminder}
          >
            <Icon name="check" size={20} color={DARK} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => setShowAdd(false)}
          >
            <Icon name="close" size={20} color={NEON} />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowAdd(true)}
        >
          <Icon name="plus-circle" size={22} color={NEON} />
          <Text style={styles.addBtnText}>Add Reminder</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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

export default Reminders;
