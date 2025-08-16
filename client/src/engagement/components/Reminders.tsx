import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextField } from 'react-native-ui-lib';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector, useDispatch } from 'react-redux';
import { EngagementRootState } from '../store/store';
import { addReminder, setUserEngagementDb } from '../store/userEngagement.slice';
import { Reminder } from '../store/primitives/UserEngagement';

const NEON = '#EFFF3C';
const DARK = '#181A1B';

const Reminders = ({ userId }: { userId: string }) => {
  const reminders = useSelector((state: EngagementRootState) => state.userEngagement.engagements[userId]?.reminders);
  const dispatch = useDispatch();

  const [showAdd, setShowAdd] = useState(false);
  const [newTime, setNewTime] = useState('');
  const [newLabel, setNewLabel] = useState('');

  const handleAddReminder = () => {
    if (!newTime || !newLabel) return;
    const newReminder: Reminder = {
      id: `rem_${Date.now()}`,
      text: newLabel,
      time: newTime,
    };
    dispatch(addReminder({ userId, reminder: newReminder }));
    setShowAdd(false);
    setNewTime('');
    setNewLabel('');
  };

  useEffect(() => {
    dispatch(setUserEngagementDb(userId));
  }, []);

  return (
    <View style={{width: '90%'}} marginB-18>
      <Text color={NEON} text70b marginB-8>Reminders</Text>
      {reminders && reminders.map((r) => (
        <View key={r.id} row centerV bg-grey20 br12 paddingV-12 paddingH-14 marginB-10>
          <Icon
            name="alarm"
            size={20}
            color={NEON}
            style={{ marginRight: 12 }}
          />
          <Text white text80>{r.text} at {r.time}</Text>
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
