import React, { useState } from 'react';
import { FlatList } from 'react-native';
import { View, Text, Button, RadioButton, RadioGroup } from 'react-native-ui-lib';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const quizData = {
  title: 'Aptitude Test',
  timer: '2:00',
  questionNumber: 1,
  totalQuestions: 2,
  question: 'If a car travels 200 miles in 4 hours, what is its average speed?',
  options: [
    '40 Mph',
    '50 Mph',
    '60 Mph',
    '70 Mph',
  ],
};

const Quiz = ({ onNext }: { onNext: () => void }) => {
  const [selected, setSelected] = useState(0);

  return (
    <View flex bg-white br24 style={{elevation: 2, shadowColor: '#A259FF', shadowOpacity: 0.08, shadowRadius: 12}}>
      <View row spread centerV paddingH-18 paddingT-10>
        <Text text70b color_grey10 flex center>{quizData.title}</Text>
        <View row centerV>
            <Icon name="clock-outline" size={20} color="#A259FF" />
            <Text text70b color-purple30 marginL-4>{quizData.timer}</Text>
        </View>
      </View>
      <View height={2} bg-purple70 marginT-10 marginH-0 style={{opacity: 0.2}}/>

      <View height={7} bg-purple70 br10 marginH-18 marginT-10>
        <View style={{width: `${(quizData.questionNumber / quizData.totalQuestions) * 100}%`, height: 7, backgroundColor: '#A259FF', borderRadius: 4}} />
      </View>

      <View flex paddingH-18 paddingT-24>
        <Text text80b color-purple30 marginB-10>
          Questions {quizData.questionNumber} of {quizData.totalQuestions}
        </Text>
        <Text text60b color_grey10 marginB-10>
          {quizData.question}
        </Text>

        <RadioGroup initialValue={quizData.options[selected]} onValueChange={(value) => setSelected(quizData.options.indexOf(value))}>
            {quizData.options.map((option, index) => (
                <View key={index} row spread centerV bg-white br12 style={{borderWidth: 1.5, borderColor: selected === index ? '#A259FF' : '#E0E0E0', paddingVertical: 14, paddingHorizontal: 16, marginBottom: 14}}>
                    <Text text70 color={selected === index ? '#A259FF' : '#222'}>{option}</Text>
                    <RadioButton value={option} color={selected === index ? '#A259FF' : '#E0E0E0'}/>
                </View>
            ))}
        </RadioGroup>
      </View>

      <Button
        label="Next"
        iconSource={() => <Icon name="arrow-right" size={20} color="#fff" />}
        iconOnRight
        onPress={onNext}
        bg-grey10
        br12
        marginH-18
        marginB-24
        marginT-8
      />
    </View>
  );
};

export default Quiz;
