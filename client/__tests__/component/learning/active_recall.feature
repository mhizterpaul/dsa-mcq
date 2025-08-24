Feature: Question Metadata State Transitions in Active Recall Workflow

  Background:
    Given a question with initial recall metadata for a user

  Scenario: Default state of question metadata before any user interaction
    Given a user has never attempted the question
    Then the recall metadata for the user has
      | correctAttempts       | 0    |
      | totalAttempts         | 0    |
      | recallStrength        | 0.0  |
      | lastAttemptTimestamp  | null |
      | techniqueTransferScores | empty map |

  Scenario: Transition on first retrieval attempt - incorrect answer
    Given a user attempts the question for the first time
    When the user answers incorrectly
    Then totalAttempts increments from 0 to 1
    And correctAttempts remains 0
    And recallStrength updates to a low value reflecting poor recall
    And lastAttemptTimestamp is set to current time
    And techniqueTransferScores update to reduce scores for relevant techniques

  Scenario: Transition on retrieval attempt - correct answer
    Given a user has existing recall metadata with N attempts
    When the user answers correctly
    Then totalAttempts increments by 1
    And correctAttempts increments by 1
    And recallStrength increases proportionally to successful recall and spaced repetition model
    And lastAttemptTimestamp updates to current time
    And techniqueTransferScores update to improve scores for relevant techniques

  Scenario: Transition on repeated incorrect attempts
    Given a user has multiple previous incorrect attempts
    When the user answers incorrectly again
    Then totalAttempts increments
    And correctAttempts remains unchanged
    And recallStrength decreases or decays according to failure penalty rules
    And lastAttemptTimestamp updates

  Scenario: Transition on no interaction over time (decay)
    Given a user has recall metadata with lastAttemptTimestamp older than decay threshold
    When the system triggers decay process
    Then recallStrength decays proportionally to time elapsed
    And techniqueTransferScores may also decay to reflect fading transfer mastery

  Scenario: Transition enforcing retrieval before feedback
    Given recall metadata with totalAttempts = 0
    When user requests feedback
    Then system denies feedback
    And metadata state remains unchanged

  Scenario: Transition on feedback provision after retrieval
    Given recall metadata with totalAttempts > 0
    When user requests feedback
    Then system provides feedback
    And metadata state may update if feedback involves corrective steps or hints
