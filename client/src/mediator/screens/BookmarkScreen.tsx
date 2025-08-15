import React from 'react';
import { StyleSheet } from 'react-native';
import { View, Text, Button, ListItem } from 'react-native-ui-lib';
import { ScrollView } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

const questions = [
  { id: '1', text: 'What does UI stand fo...' },
  { id: '2', text: 'Which aspect of UI de...' },
  { id: '3', text: 'How to export a pictu...' },
  { id: '4', text: 'Which term refers to t...' },
  { id: '5', text: 'Why is maintaining co...' },
];

const BookmarkScreen = () => {
  return (
    <View flex bg-white>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Text text80H grey40 marginB-20 uppercase>
          Questions ({questions.length})
        </Text>
        {questions.map((q, index) => (
          <ListItem key={q.id} height={77.5} onPress={() => {}}>
            <ListItem.Part left>
                <Text text70 grey10 marginR-15>{index + 1}</Text>
            </ListItem.Part>
            <ListItem.Part middle column>
              <ListItem.Part middle>
                <Text text70 grey10>{q.text}</Text>
              </ListItem.Part>
            </ListItem.Part>
            <ListItem.Part right>
                <Feather name="more-vertical" size={20} color="#888" />
            </ListItem.Part>
          </ListItem>
        ))}
      </ScrollView>
      <Button
        label="Result Screen"
        iconSource={() => <Feather name="bar-chart-2" size={20} color="black" />}
        backgroundColor="#eee"
        color="black"
        style={styles.resultButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    padding: 20,
  },
  resultButton: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
});

export default BookmarkScreen;
