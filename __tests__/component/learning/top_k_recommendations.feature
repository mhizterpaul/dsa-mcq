
Feature: Feedback Mechanism with Exponentially Weighted Top-K Question Recommendations

  Background:
    Given a user is in a learning session
    And questions Q1, Q2, Q3, Q4 are tagged with categories C1, C2, and C3 respectively
    And the system maintains for the user:
      | Question | Local State          | Categories      | Mastery Score (0 to 1) |
      | Q1       | STRUGGLING          | C1              | 0.2                    |
      | Q2       | PARTIALLY_MASTERED  | C1, C2          | 0.5                    |
      | Q3       | MASTERED            | C2              | 0.9                    |
      | Q4       | NOT_ATTEMPTED       | C3              | 0.0                    |
    And global category mastery states are:
      | Category | Global State          | Mastery Score (0 to 1) |
      | C1       | STRUGGLING           | 0.2                    |
      | C2       | PARTIALLY_MASTERED   | 0.5                    |
      | C3       | NOT_ATTEMPTED        | 0.0                    |

  Scenario: Metadata state verification before recommendation
    Given the user has valid metadata for all questions and categories
    Then each question and category mastery score is within the range 0.0 to 1.0
    And local and global states match mastery score thresholds:
      | State              | Mastery Score Range    |
      | STRUGGLING         | 0.0 <= score < 0.4    |
      | PARTIALLY_MASTERED | 0.4 <= score < 0.8    |
      | MASTERED           | 0.8 <= score <= 1.0   |
      | NOT_ATTEMPTED      | score == 0.0          |

  Scenario: Generate top-k (k=3) question recommendations using exponential scoring
    Given k = 3
    When the system computes recommendation scores using the formula:
      | RecommendationScore = exp(-β * MasteryScore) where β > 0 |
    Then the system outputs a ranked list of top 3 questions:
      | Rank | Question | RecommendationScore | Reason                       |
      | 1    | Q4       | highest             | New question, mastery 0.0    |
      | 2    | Q1       | high                | STRUGGLING, low mastery 0.2 |
      | 3    | Q2       | moderate            | PARTIALLY_MASTERED 0.5       |
    And mastered questions like Q3 have exponentially low scores and are excluded or ranked last

  Scenario: Feedback output includes prioritized recommendation rationale
    Given the system has generated top-k recommendations
    When the user requests feedback on learning focus
    Then the system outputs:
      | Category | RecommendationLevel | Explanation                                    |
      | C3       | High               | New category with no attempts, needs exposure|
      | C1       | High               | Struggling category, focus recommended        |
      | C2       | Medium             | Partial mastery, reinforcement suggested      |
      | Others   | Low or None        | Mastered categories deprioritized             |

  Scenario: Recommendation scoring differs from linear scoring significantly
    Given the system computes linear scores as (1 - MasteryScore)
    And the system computes exponential scores as exp(-β * MasteryScore)
    When comparing the two scoring methods for question Q2 with MasteryScore=0.5
    Then the exponential score prioritizes lower mastery questions more sharply than linear scoring

