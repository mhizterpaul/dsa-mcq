import { learningService } from '../../src/components/learning/services/learningService';
import { UserQuestionData } from '../../src/components/learning/store/primitives/UserQuestionData';

describe('learningService', () => {
  describe('processAnswer', () => {
    it('should update UserQuestionData correctly for a correct answer', () => {
      const uqd = new UserQuestionData('user1', 'q1');
      const updatedUqd = learningService.processAnswer(uqd, true, 5);

      expect(updatedUqd.correctAttempts).toBe(1);
      expect(updatedUqd.totalAttempts).toBe(1);
      expect(updatedUqd.sm2.repetitionCount).toBe(1);
    });

    it('should update UserQuestionData correctly for an incorrect answer', () => {
      const uqd = new UserQuestionData('user1', 'q1');
      const updatedUqd = learningService.processAnswer(uqd, false, 1);

      expect(updatedUqd.correctAttempts).toBe(0);
      expect(updatedUqd.totalAttempts).toBe(1);
      expect(updatedUqd.sm2.repetitionCount).toBe(0);
    });
  });
});
