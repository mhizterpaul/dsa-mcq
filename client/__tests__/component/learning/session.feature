Feature: Orchestrate practice session pipeline

  Background:
    Given a session with N total questions
    And 1/4 of the questions are selected as the top-K subset
    And the system supports active recall, SM-2, and per-question feedback

  Scenario: Process each top-K question through full pipeline
    When the top-K subset is selected
    And each question is presented to the user
    And the user provides an answer
    Then the system should evaluate the answer using active recall
    And pass the evaluation result to SM-2 for scheduling
    And generate per-question feedback from the evaluation
    And store SM-2 and feedback results for the question

  Scenario: Present top-K subset in active recall priority order
    Given active recall metadata for all questions
    When selecting the top-K subset
    Then the questions should be ordered by priority derived from active recall metadata
    And the highest priority question should be presented first

  Scenario: Iterate top-K processing across four subsets in one session
    Given feedback and SM-2 data from the previous subset
    When the next top-K subset is selected
    And processed through user answer → active recall → SM-2 → feedback
    Then the system should repeat until four subsets have been completed
    And collate all SM-2 and feedback results

  Scenario: Compile session summary and schedule next session
    Given SM-2 and feedback results from all four subsets
    When the session ends
    Then present the user with collated feedback highlighting strengths and weaknesses
    And prepare the next session schedule using aggregated SM-2 scores

  Scenario: Show previous session feedback if last session was the previous day or older
    Given the last completed session was on the previous day or earlier
    When the user starts a new session
    Then the system should display feedback from the most recent completed session
    And the feedback should highlight strengths and weaknesses
    And the display should occur before the first question of the new session