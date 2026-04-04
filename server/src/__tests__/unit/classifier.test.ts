import { classifyQuestion, QuestionType } from '../../utils/classifier';

describe('Question Classification Engine', () => {
    test('should classify as DATA_STRUCTURE given DS keywords', () => {
        const text = 'Implement a Stack using two queues';
        expect(classifyQuestion(text)).toBe(QuestionType.DATA_STRUCTURE);
    });

    test('should classify as ALGORITHM given Algo keywords', () => {
        const text = 'Find the shortest path using Dijkstra and optimize the distance';
        expect(classifyQuestion(text)).toBe(QuestionType.ALGORITHM);
    });

    test('should classify as DATA_STRUCTURE given mixed but more DS keywords', () => {
        const text = 'Store the tree nodes in a heap and sort them';
        // DS: tree, heap (2)
        // Algo: sort (1)
        expect(classifyQuestion(text)).toBe(QuestionType.DATA_STRUCTURE);
    });

    test('should classify as ALGORITHM given mixed but more Algo keywords', () => {
        const text = 'Optimize the Manhattan distance search algorithm';
        // DS: (0)
        // Algo: optimize, manhattan, distance, search (4)
        expect(classifyQuestion(text)).toBe(QuestionType.ALGORITHM);
    });

    test('should classify as OTHER given no keywords', () => {
        const text = 'What is the capital of France?';
        expect(classifyQuestion(text)).toBe(QuestionType.OTHER);
    });
});
