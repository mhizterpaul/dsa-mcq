export enum QuestionType {
    ALGORITHM = 'ALGORITHM',
    DATA_STRUCTURE = 'DATA_STRUCTURE',
    OTHER = 'OTHER'
}

export function classifyQuestion(text: string): QuestionType {
    const lowerText = text.toLowerCase();

    const dsKeywords = ['stack', 'queue', 'heap', 'linked list', 'tree', 'graph', 'array', 'hash table', 'map', 'set'];
    const algoKeywords = ['optimize', 'path', 'distance', 'sort', 'search', 'greedy', 'dynamic programming', 'recursion', 'complexity', 'manhattan'];

    let dsScore = 0;
    let algoScore = 0;

    dsKeywords.forEach(kw => {
        if (lowerText.includes(kw)) dsScore++;
    });

    algoKeywords.forEach(kw => {
        if (lowerText.includes(kw)) algoScore++;
    });

    if (dsScore === 0 && algoScore === 0) return QuestionType.OTHER;

    return dsScore >= algoScore ? QuestionType.DATA_STRUCTURE : QuestionType.ALGORITHM;
}
