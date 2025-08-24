Feature: Engagement Reminders and Motivational Nudges
  Ensures users stay motivated and engaged through timely reminders, 
  visual progress cues, and gamified achievement indicators based on 
  tracked engagement metrics.

  Background:
    Given the system tracks:
      | Metric             | Description |
      | session_attendance | % of attended sessions over rolling 7/30 days |
      | streak_length      | Consecutive days with at least one completed session |
      | response_latency   | Time between reminder sent and session start |
      | xp_progress        | Current XP towards next level |
      | leaderboard_rank   | Current position relative to other users |
    And reminder/nudge tone is encouraging, action-oriented, and ≤ 50 characters
    And visual cues include progress bars, animations, and leaderboard change indicators

  Scenario: Schedule personalized reminder before next session
    Given the next session is due in 4 hours according to SM-2 scheduling
    And the user’s preferred lead time is 2 hours
    When the system schedules the reminder
    Then the reminder should be sent exactly 2 hours before the scheduled session
    And the message should reference the upcoming session
    And the message should not exceed 50 characters

  Scenario: Suppress reminder if session is already started
    Given the user has started the session before the scheduled reminder time
    When the system checks pending reminders
    Then the reminder should not be sent

  Scenario: Trigger nudge for missed session
    Given the user missed yesterday’s session
    And streak_length has decreased by 1
    When the nudge is generated
    Then the message should acknowledge the missed session in a supportive tone
    And it should include a call-to-action to resume today
    And the message length should be ≤ 50 characters

  Scenario: Trigger visual cue for leaderboard change
    Given the user has moved up or down at least 1 position on the leaderboard since the last session
    When the leaderboard is displayed
    Then a visual cue should indicate the position change
    And the visual cue should be animated for emphasis
    And no text-based message is sent for this change

  Scenario: Trigger visual cue for XP milestone
    Given the user needs ≤ 50 XP to reach the next level
    When the milestone is in reach
    Then an animated progress bar should be displayed
    And the progress bar should highlight the XP remaining
    And no text-based message is sent for this milestone

  Scenario: Trigger visual cue for streak milestone
    Given the user has reached a streak milestone (e.g., 7, 30, or 100 days)
    When the milestone is achieved
    Then an animated badge should be displayed
    And the badge animation should last between 0.8s and 1.2s
    And no text-based message is sent for this milestone
