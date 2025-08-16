import React, { useState, useEffect } from 'react';
import { View, Text, Button, RadioButton, RadioGroup } from 'react-native-ui-lib';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector, useDispatch } from 'react-redux';
import { LearningRootState } from '../store';
import { startQuiz, nextQuestion, answerQuestion } from '../store/quiz.slice';
import { addQuestion, setQuestions } from '../store/question.slice';
import { Question } from '../store/primitives/Question';

const Quiz = () => {
  const dispatch = useDispatch();
  const { questions, currentQuestionIndex, isActive } = useSelector((state: LearningRootState) => state.quiz);
  const allQuestions = useSelector((state: LearningRootState) => state.questions.entities);
  const currentQuestion = allQuestions[questions[currentQuestionIndex]];

  const [selected, setSelected] = useState(0);

  const handleStartQuiz = () => {
    const dummyQuestions: Question[] = [
      new Question('q1', 'If a car travels 200 miles in 4 hours, what is its average speed?', ['40 Mph', '50 Mph', '60 Mph', '70 Mph'], 1),
      new Question('q2', 'What is the capital of France?', ['London', 'Berlin', 'Paris', 'Madrid'], 2),
    ];
    dispatch(setQuestions(dummyQuestions));
    dispatch(startQuiz(dummyQuestions.map(q => q.id)));
  };

  const handleNext = () => {
    const isCorrect = selected === currentQuestion.correctOption;
    dispatch(answerQuestion({ questionId: currentQuestion.id, isCorrect }));
    dispatch(nextQuestion());
  };

  if (!isActive || !currentQuestion) {
    return (
      <View center>
        <Button label="Start Quiz" onPress={handleStartQuiz} />
      </View>
    );
  }

  return (
    <View flex bg-white br24 style={{elevation: 2, shadowColor: '#A259FF', shadowOpacity: 0.08, shadowRadius: 12}}>
      <View row spread centerV paddingH-18 paddingT-10>
        <Text text70b color_grey10 flex center>Aptitude Test</Text>
        <View row centerV>
            <Icon name="clock-outline" size={20} color="#A259FF" />
            <Text text70b color-purple30 marginL-4>2:00</Text>
        </View>
      </View>
      <View height={2} bg-purple70 marginT-10 marginH-0 style={{opacity: 0.2}}/>

      <View height={7} bg-purple70 br10 marginH-18 marginT-10>
        <View style={{width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`, height: 7, backgroundColor: '#A259FF', borderRadius: 4}} />
      </View>

      <View flex paddingH-18 paddingT-24>
        <Text text80b color-purple30 marginB-10>
          Questions {currentQuestionIndex + 1} of {questions.length}
        </Text>
        <Text text60b color_grey10 marginB-10>
          {currentQuestion.text}
        </Text>

        <RadioGroup initialValue={currentQuestion.options[selected]} onValueChange={(value) => setSelected(currentQuestion.options.indexOf(value))}>
            {currentQuestion.options.map((option, index) => (
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
        onPress={handleNext}
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
