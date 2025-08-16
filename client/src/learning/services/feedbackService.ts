import * as genAI from '@google/genai';
import { Question } from '../store/primitives/Question';

// --- CONFIGURATION ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.warn('Gemini API key not found. Please set the GEMINI_API_KEY environment variable.');
}
const googleAI = new genAI.GoogleGenerativeAI(GEMINI_API_KEY || '');

// --- TYPES ---
export interface Feedback {
  correct_approach: string;
  incorrect_approach: string;
}

// --- BATCH FEEDBACK IMPLEMENTATION ---

const buildBatchPrompt = (questions: Question[]): string => {
  const questionPrompts = questions.map(q => {
    const { id, text, options, correctOption, categories } = q;
    const correctOptionText = options[correctOption];
    return `
      Question ID: "${id}"
      Category: ${categories.join(', ')}
      Question: ${text}
      Options: ${options.join(', ')}
      Correct Answer: ${correctOptionText}
    `;
  }).join('\n---\n');

  return `
    Generate feedback for the following list of multiple-choice questions.
    Return a single JSON object where each key is the question's ID (e.g., "q1") and the value is another JSON object with two keys: "correct_approach" and "incorrect_approach".

    Adhere to these criteria for each question's feedback:
    1.  Provide a "correct_approach" and an "incorrect_approach".
    2.  Each approach must be a single sentence and no more than 50 characters long.
    3.  Both approaches must reference the correct option.
    4.  The tone for both approaches must be consistent and encouraging.
    5.  Avoid unnecessary jargon.
    6.  Ensure the final output is a valid JSON object with no other text or formatting.

    Here are the questions:
    ${questionPrompts}
  `;
};

const generateBatchFeedback = async (questions: Question[]): Promise<Record<string, Feedback>> => {
  if (!GEMINI_API_KEY || questions.length === 0) {
    return {};
  }

  const model = googleAI.getGenerativeModel({ model: 'gemini-pro' });
  const prompt = buildBatchPrompt(questions);

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const feedbackJsonText = response.text().replace(/```json|```/g, '').trim(); // Clean up potential markdown
    const feedbackMap = JSON.parse(feedbackJsonText);
    return feedbackMap;
  } catch (error) {
    console.error('Error generating batch feedback:', error);
    // Return an empty map or partial results if applicable
    return {};
  }
};


// --- SINGLE FEEDBACK IMPLEMENTATION (Legacy or for single use) ---

const buildSinglePrompt = (question: Question): string => {
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

const generateFeedback = async (question: Question): Promise<Feedback> => {
  if (!GEMINI_API_KEY) {
    return {
      correct_approach: 'API key not configured.',
      incorrect_approach: 'API key not configured.',
    };
  }

  const model = googleAI.getGenerativeModel({ model: 'gemini-pro' });
  const prompt = buildSinglePrompt(question);

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
