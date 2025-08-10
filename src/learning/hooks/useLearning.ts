import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store'; // Assuming a root store will be created
import {
  addCategory,
  addQuestion,
  startSession,
  updateUserQuestionData,
} from '../store';

export const useLearning = () => {
  const dispatch = useDispatch();

  const learningState = useSelector((state: RootState) => state.learning);

  // Example action dispatcher
  const createNewCategory = (category: any) => {
    dispatch(addCategory(category));
  };

  return {
    learningState,
    actions: {
      addCategory: createNewCategory,
      addQuestion: (question: any) => dispatch(addQuestion(question)),
      startSession: (session: any) => dispatch(startSession(session)),
      updateUserQuestionData: (data: any) => dispatch(updateUserQuestionData(data)),
    },
  };
};
