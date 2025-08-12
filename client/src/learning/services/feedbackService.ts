import * as genAI from '@google/genai';
import { Question } from '../store/primitives/Question';

// TODO: User must provide a valid API key in the environment variables.
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn(
    'Gemini API key not found. Please set the GEMINI_API_KEY environment variable.',
  );
}

const googleAI = new genAI.GoogleGenerativeAI(GEMINI_API_KEY || '');

const buildPrompt = (question: Question): string => {
  const { text, options, correctOption, categories } = question;
  const correctOptionText = options[correctOption];

  return `
    For the following multiple-choice question about ${categories.join(', ')}:

    Question: ${text}
    Options: ${options.join(', ')}
    Correct Answer: ${correctOptionText}

    Generate feedback that meets these criteria:
    1.  Provide a "correct_approach" and an "incorrect_approach".
    2.  Each approach must be a single sentence.
    3.  Each approach must be no more than 50 characters long.
    4.  Both approaches must reference the correct option.
    5.  The tone for both approaches must be consistent and encouraging.
    6.  Avoid unnecessary jargon.

    Return the feedback as a JSON object with two keys: "correct_approach" and "incorrect_approach".
    Do not include any other text or formatting in your response.
  `;
};

export const generateFeedback = async (question: Question): Promise<{ correct_approach: string; incorrect_approach: string }> => {
  if (!GEMINI_API_KEY) {
    return {
      correct_approach: 'API key not configured.',
      incorrect_approach: 'API key not configured.',
    };
  }

  const model = googleAI.getGenerativeModel({ model: 'gemini-pro' });
  const prompt = buildPrompt(question);

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const feedbackJson = response.text();
    const feedback = JSON.parse(feedbackJson);
    return feedback;
  } catch (error) {
    console.error('Error generating feedback:', error);
    return {
      correct_approach: 'Error generating feedback.',
      incorrect_approach: 'Error generating feedback.',
    };
  }
};
