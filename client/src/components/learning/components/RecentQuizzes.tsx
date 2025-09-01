import React, { useEffect } from 'react';
import { View, Text, Button } from 'react-native-ui-lib';
import { useSelector, useDispatch } from 'react-redux';
import { LearningRootState } from '../store';
import { addRecentQuiz } from '../store/recentQuizzes.slice';
import { RecentQuiz } from '../store/primitives/RecentQuiz';

const RecentQuizzes = () => {
    const recentQuizzes = useSelector((state: LearningRootState) => Object.values(state.recentQuizzes.entities));
    const dispatch = useDispatch();

    const handleAddDummyData = () => {
        const dummyQuiz: RecentQuiz = {
            id: `rq_${Date.now()}`,
            name: 'Aptitude Test',
            score: 8,
            totalQuestions: 10,
        };
        dispatch(addRecentQuiz(dummyQuiz));
    };

    useEffect(() => {
        handleAddDummyData();
    }, []);

  return (
    <View>
        <View row spread centerV marginH-18 marginT-28 marginB-10>
            <Text text70b color_grey10>Recent Quiz</Text>
            <Button link label="See All" labelStyle={{color: '#FF7A3C', fontWeight: 'bold'}} />
        </View>
        {recentQuizzes.map((quiz) => (
            <View key={quiz.id} row spread centerV marginH-18 marginB-10 bg-white br20 padding-16>
                <View>
                    <Text text70b>{quiz.name}</Text>
                    <Text text80>Score: {quiz.score}/{quiz.totalQuestions}</Text>
                </View>
                <Button label="Retake" size={Button.sizes.small} />
            </View>
        ))}
    </View>
  );
};

export default RecentQuizzes;
