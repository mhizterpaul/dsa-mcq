Feature: Per-question feedback quality
  Validate that feedback for each DSA-MCQ question is concise, relevant,
  and consistent in tone.

  Scenario Outline: Feedback contains both correct and incorrect approaches
    When feedback is generated for question <question_id>
    Then the response map should contain "correct_approach" and "incorrect_approach"
    And each value should be no more than one sentence
    And each value should be no more than 50 characters long
    And each value should reference the correct option with similarity above threshold
    And the tone of both approaches should be consistent

    Examples:
      | question_id | category       |
      | Q1          | binary trees   |
      | Q2          | hash maps      |
      | Q3          | dynamic arrays |

  Scenario Outline: Feedback tone and readability
    When feedback is generated for question <question_id>
    Then the tone for "correct_approach" and "incorrect_approach" should match
    And the readability score should be within acceptable range
    And no unnecessary jargon should be present

    Examples:
      | question_id | category         |
      | Q4          | graph traversal  |
      | Q5          | priority queues  |

  Scenario Outline: Feedback references correct option
    When feedback is generated for question <question_id>
    Then both "correct_approach" and "incorrect_approach" should reference the correct option
    And the reference should be relevant to the question category

    Examples:
      | question_id | category        |
      | Q6          | linked lists    |
      | Q7          | sorting algorithms |
