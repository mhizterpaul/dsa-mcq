import React, { useState } from 'react';
import { View, Text, Button, TextField } from 'react-native-ui-lib';
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
    <View style={{width: '90%'}} marginB-18>
      <Text color={NEON} text70b marginB-8>Reminders</Text>
      {reminders.map((r, i) => (
        <View key={i} row centerV bg-grey20 br12 paddingV-12 paddingH-14 marginB-10>
          <Icon
            name={r.icon}
            size={20}
            color={NEON}
            style={{ marginRight: 12 }}
          />
          <Text white text80>{r.text}</Text>
        </View>
      ))}
      {showAdd ? (
        <View row centerV marginT-8 bg-grey20 br12 padding-8>
          <TextField
            placeholder="Time"
            value={newTime}
            onChangeText={setNewTime}
            style={{color: NEON}}
            containerStyle={{flex: 1, marginRight: 8}}
          />
          <TextField
            placeholder="Label"
            value={newLabel}
            onChangeText={setNewLabel}
            style={{color: NEON}}
            containerStyle={{flex: 1, marginRight: 8}}
          />
          <Button iconSource={() => <Icon name="check" size={20} color={DARK} />} onPress={handleAddReminder} bg-yellow30 br10 padding-6 marginR-6 />
          <Button iconSource={() => <Icon name="close" size={20} color={NEON} />} onPress={() => setShowAdd(false)} link />
        </View>
      ) : (
        <Button
          label="Add Reminder"
          iconSource={() => <Icon name="plus-circle" size={22} color={NEON} />}
          onPress={() => setShowAdd(true)}
          link
          color={NEON}
          labelStyle={{fontWeight: 'bold'}}
          style={{alignSelf: 'flex-start'}}
        />
      )}
    </View>
  );
};

export default Reminders;
