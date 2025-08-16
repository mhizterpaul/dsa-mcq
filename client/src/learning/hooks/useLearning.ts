import { useSelector, useDispatch } from 'react-redux';
import { addCategory } from '../store/category.slice';
import { addQuestion } from '../store/question.slice';
import { startSession } from '../store/learningSession.slice';
import { answerCorrectly, answerIncorrectly } from '../store/userQuestionData.slice';

export const useLearning = () => {
  const dispatch = useDispatch();

  const learningState = useSelector((state: RootState) => state.learning);

  return {
    learningState,
    actions: {
      addCategory: (category: any) => dispatch(addCategory(category)),
      addQuestion: (question: any) => dispatch(addQuestion(question)),
      startSession: (session: any) => dispatch(startSession(session)),
      answerCorrectly: (data: any) => dispatch(answerCorrectly(data)),
      answerIncorrectly: (data: any) => dispatch(answerIncorrectly(data)),
    },
  };
};
