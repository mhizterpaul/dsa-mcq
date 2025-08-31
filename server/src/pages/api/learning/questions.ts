import type { NextApiRequest, NextApiResponse } from 'next';

export interface Question {
    id: number;
    question: string;
    category: string;
    tags: string[];
    options: {
        text: string;
        isCorrect: boolean;
    }[];
}

const questions: Question[] = [
    {
        id: 1,
        question: "Two Sum\nGiven an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.",
        category: "algorithms",
        tags: ['hash map', 'two sum', 'time complexity'],
        options: [
            { text: "Use a brute-force approach with nested loops to check all possible pairs of numbers.", isCorrect: false },
            { text: "Sort the array and use binary search to find the complement of each number.", isCorrect: false },
            { text: "Use recursion to explore all possible combinations of numbers.", isCorrect: false },
            { text: "Iterate through the array and keep track of the minimum difference from the target.", isCorrect: false },
            { text: "Use a hash map to store each number and its index, then check if the complement exists in the map.", isCorrect: true },
        ]
    },
    {
        id: 2,
        question: "Add Two Numbers\nYou are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list. You may assume the two numbers do not contain any leading zero, except the number 0 itself.",
        category: "algorithms",
        tags: ['linked list', 'arithmetic', 'pointers'],
        options: [
            { text: "Use a hash map to store the digits and their positions, then perform addition based on position values", isCorrect: false },
            { text: "Recursively add the digits from the head nodes, returning a new list if the result is less than 10", isCorrect: false },
            { text: "Convert both lists to strings, concatenate them, and convert the resulting string back to a linked list", isCorrect: false },
            { text: "Subtract the smaller number from the larger and rebuild the smaller number's linked list", isCorrect: false },
            { text: "Traverse both lists node-by-node, adding digits with carry, and build a new list for the result", isCorrect: true },
        ]
    },
    {
        id: 3,
        question: "Longest Substring Without Repeating Characters\nGiven a string s, find the length of the longest substring without duplicate characters.",
        category: "algorithms",
        tags: ['string manipulation', 'sliding window', 'hash map'],
        options: [
            { text: "Use a sliding window approach, resetting the window start index whenever a repeated character is encountered but only after calculating current substring length.", isCorrect: false },
            { text: "Sort the string and then iterate through it to find the longest substring.", isCorrect: false },
            { text: "Generate all possible substrings and check each for repeating characters; return the length of the longest valid substring.", isCorrect: false },
            { text: "Employ dynamic programming to store lengths of all substrings ending at each index.", isCorrect: false },
            { text: "Use a sliding window approach with a hash map (or set) to track characters in the current window, updating the start index when a duplicate is found.", isCorrect: true },
        ]
    },
    {
        id: 4,
        question: "Median of Two Sorted Arrays\nGiven two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays. The overall run time complexity should be O(log (m+n)).",
        category: "algorithms",
        tags: ['binary search', 'sorted arrays', 'median'],
        options: [
            { text: "Use a hash table to count the frequency of each number, then iterate from smallest to largest to find the median.", isCorrect: false },
            { text: "Merge the arrays, then calculate the median directly using the length of the merged array. This has O(m+n) time complexity.", isCorrect: false },
            { text: "Sort both arrays independently using an O(n log n) algorithm, then find the median of the concatenated result.", isCorrect: false },
            { text: "Perform a linear scan across both arrays simultaneously, tracking elements until the middle is reached.", isCorrect: false },
            { text: "Use binary search to find the partition points in both arrays such that all elements to the left are smaller than elements to the right.", isCorrect: true },
        ]
    },
    {
        id: 5,
        question: "Longest Palindromic Substring\nGiven a string s, return the longest palindromic substring in s.",
        category: "algorithms",
        tags: ['string', 'palindrome', 'dynamic programming'],
        options: [
            { text: "Use dynamic programming with a 2D table storing palindrome information for all substrings", isCorrect: false },
            { text: "Employ a recursive approach, checking all possible substrings for palindrome property.", isCorrect: false },
            { text: "Sort the string and identify common subsequences as potential palindromes.", isCorrect: false },
            { text: "Reverse the string and find the longest common substring with the original string.", isCorrect: false },
            { text: "Apply the expanding center approach, checking for palindromes around each character and pair of characters.", isCorrect: true },
        ]
    },
    {
        id: 6,
        question: "Zigzag Conversion\nThe string \"PAYPALISHIRING\" is written in a zigzag pattern on a given number of rows like this: (you may want to display this pattern in a fixed font for better legibility) And then read line by line: \"PAHNAPLSIIGYIR\" Write the code that will take a string and make this conversion given a number of rows:",
        category: "algorithms",
        tags: ['string manipulation', 'pattern matching', 'algorithm'],
        options: [
            { text: "Hash each character based on its row index in the zigzag pattern and then concatenate the hash values.", isCorrect: false },
            { text: "Sort the string alphabetically and then redistribute characters based on row indices.", isCorrect: false },
            { text: "Use a matrix to store the zigzag pattern and read the matrix row by row to form the converted string.", isCorrect: false },
            { text: "Reverse the input string and apply a standard string reversal algorithm.", isCorrect: false },
            { text: "Calculate the row index for each character based on the zigzag pattern and append it to the corresponding row string, then concatenate the row strings.", isCorrect: true },
        ]
    },
    {
        id: 7,
        question: "Reverse Integer\nGiven a signed 32-bit integer x, return x with its digits reversed. If reversing x causes the value to go outside the signed 32-bit integer range [-231, 231 - 1], then return 0. Assume the environment does not allow you to store 64-bit integers (signed or unsigned).",
        category: "algorithms",
        tags: ['integer manipulation', 'overflow', 'arithmetic'],
        options: [
            { text: "Using strings to represent the numbers allows easy reversal, but doesn't address overflow correctly.", isCorrect: false },
            { text: "Reversing the number by repeatedly dividing by 10 and multiplying by 10 in each step.", isCorrect: false },
            { text: "Shifting the integer bits to the left and then using bitwise OR to add the last digit.", isCorrect: false },
            { text: "Using an array to store the reversed digits and then reconstructing the integer.", isCorrect: false },
            { text: "Repeatedly popping the last digit using the modulo operator and building the reversed integer while checking for overflow before multiplication.", isCorrect: true },
        ]
    },
    {
        id: 8,
        question: "String to Integer (atoi)\nImplement the myAtoi(string s) function, which converts a string to a 32-bit signed integer. The algorithm for myAtoi(string s) is as follows: Return the integer as the final result.",
        category: "algorithms",
        tags: ['string parsing', 'integer conversion', 'edge cases'],
        options: [
            { text: "Assume all non-numeric characters are valid and should be converted to their ASCII integer representation.", isCorrect: false },
            { text: "Ignore leading and trailing whitespaces, but any whitespace in between digits is significant and ends the conversion.", isCorrect: false },
            { text: "Only positive integers are supported. Negative signs and '+' signs are ignored, and the conversion begins at the first digit encountered.", isCorrect: false },
            { text: "If the resulting integer is outside the 32-bit signed integer range, return 0.", isCorrect: false },
            { text: "Read and ignore leading whitespace, handle optional sign, read digits until a non-digit character or end of string is found, and clamp the result to the 32-bit signed integer range.", isCorrect: true },
        ]
    },
    {
        id: 9,
        question: "Palindrome Number\nGiven an integer x, return true if x is a palindrome, and false otherwise.",
        category: "algorithms",
        tags: ['palindrome', 'integer manipulation', 'reversal'],
        options: [
            { text: "Convert the number to a string and check if the reversed string is equal to the original.", isCorrect: false },
            { text: "Iterate through half of the number, comparing digits at corresponding positions from the beginning and end, using string conversion.", isCorrect: false },
            { text: "Use bitwise operations to reverse the number and compare it with the original.", isCorrect: false },
            { text: "Recursively divide the number by 10 until a single digit is reached and compare with the original number using a global variable.", isCorrect: false },
            { text: "Reverse the number without using extra space and compare it to the original number.", isCorrect: true },
        ]
    },
    {
        id: 10,
        question: "Regular Expression Matching\nGiven an input string s and a pattern p, implement regular expression matching with support for '.' and '*' where: The matching should cover the entire input string (not partial).",
        category: "algorithms",
        tags: ['regular expression', 'dynamic programming', 'pattern matching'],
        options: [
            { text: "Backtracking: Explore all possible matching combinations recursively, pruning branches that don't lead to a full match.", isCorrect: false },
            { text: "Brute Force: Generate all possible strings from the pattern and compare them against the input string.", isCorrect: false },
            { text: "Greedy Matching: At each step, match the longest possible substring allowed by the pattern.", isCorrect: false },
            { text: "Memoization: Store results of subproblems involving the pattern and input up to certain indices and reuse the values to avoid redundant computation.", isCorrect: false },
            { text: "Dynamic Programming: Build a table to store whether substrings of 's' match substrings of 'p', handling base cases and transitions for '.' and '*'.", isCorrect: true },
        ]
    },
    {
        id: 11,
        question: "Container With Most Water\nYou are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]). Find two lines that together with the x-axis form a container, such that the container contains the most water. Return the maximum amount of water a container can store. Notice that you may not slant the container.",
        category: "algorithms",
        tags: ['array', 'two pointers', 'optimization'],
        options: [
            { text: "Sort the height array and calculate the area using the two tallest lines.", isCorrect: false },
            { text: "Calculate the area for every possible pair of lines, keeping track of the maximum.", isCorrect: false },
            { text: "Start with the widest container and greedily shrink it by removing the taller of the two lines.", isCorrect: false },
            { text: "Use binary search to find the optimal width and then search for the corresponding heights.", isCorrect: false },
            { text: "Use two pointers, one at each end of the array, and move the pointer with the smaller height towards the center.", isCorrect: true },
        ]
    },
    {
        id: 12,
        question: "Integer to Roman\nSeven different symbols represent Roman numerals",
        category: "algorithms",
        tags: ['integer conversion', 'roman numerals', 'greedy algorithm'],
        options: [
            { text: "Using a greedy algorithm, repeatedly subtract the largest possible Roman numeral value until the integer reaches zero.", isCorrect: false },
            { text: "Decompose the integer into its prime factors and map the primes to Roman numerals.", isCorrect: false },
            { text: "Recursively divide the integer by 10 and construct the Roman numeral from right to left.", isCorrect: false },
            { text: "Convert the integer to binary, then map the binary digits to Roman numerals.", isCorrect: false },
            { text: "Decompose the integer into thousands, hundreds, tens, and ones, then convert each place value to its Roman numeral equivalent and concatenate the results.", isCorrect: true },
        ]
    }
];

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Question[] | { error: string }>
) {
  if (req.method === 'POST') {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ error: 'Request body must be an object with an "ids" array.' });
    }

    // const requestedQuestions = questions.filter(q => ids.includes(q.id));
    return res.status(200).json([]);

  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
