Feature: SM-2 Spaced Repetition State Management

  Background:
    Given a new question "Q1" with no prior reviews

  Scenario: Initial state for a new question
    Then the repetition count should be 0
    And the easiness factor should be 2.5
    And the interval should be 0 (due immediately)
    And the last reviewed timestamp should be null or unset

  Scenario: First review with good quality response (quality >= 3)
    When the user answers "Q1" with quality score 4
    Then the repetition count should be set to 1
    And the interval should be set to 1 day
    And the last reviewed timestamp should be updated to now
    And the easiness factor should remain approximately 2.5 or be adjusted slightly

  Scenario: First review with poor quality response (quality < 3)
    When the user answers "Q1" with quality score 2
    Then the repetition count should be reset to 0
    And the interval should be 0 (due immediately)
    And the last reviewed timestamp should be updated to now
    And the easiness factor should decrease but not below 1.3

  Scenario Outline: Subsequent review updates based on quality score
    Given question "Q1" has:
      | repetitionCount | <PrevCount>      |
      | easinessFactor  | <PrevEF>         |
      | interval        | <PrevInterval>   |
    When the user answers "Q1" with quality score <Quality>
    Then the easiness factor should be updated to approximately <ExpectedEF> (min 1.3)
    And the repetition count should be <ExpectedCount>
    And the interval should be updated proportionally based on repetition count and easiness factor
    And the last reviewed timestamp should be updated to now

    Examples:
      | PrevCount | PrevEF | PrevInterval | Quality | ExpectedEF | ExpectedCount |
      | 1         | 2.5    | 1 day       | 5       | 2.6        | 2             |
      | 2         | 2.6    | 6 days      | 4       | 2.54       | 3             |
      | 3         | 2.54   | 15 days     | 2       | 1.88       | 0             |
      | 0         | 2.5    | 0           | 5       | 2.6        | 1             |

  Scenario: Easiness factor cannot go below 1.3
    Given question "Q2" has easiness factor 1.4
    When the user answers "Q2" with quality score 0
    Then the easiness factor should be set to 1.3 (minimum threshold)
