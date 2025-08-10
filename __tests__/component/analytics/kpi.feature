Feature: Aggregate telemetry for engagement KPIs and system performance

  Background:
    Given telemetry collection is enabled
    And it gathers aggregated engagement metrics without storing individual user data
    And it gathers DevOps performance metrics

  Scenario: Aggregate DevOps performance metrics
    Given metrics from API gateways, databases, and frontend clients
    When telemetry aggregation runs
    Then store:
      | Metric Name              | Description                              |
      | avg_response_time_ms     | Mean HTTP request time per endpoint      |
      | error_rate_percent       | Errors / total requests                  |
      | cpu_usage_percent        | Average CPU load per node                |
      | memory_usage_mb          | Average memory footprint per service     |
      | uptime_percent           | Availability of services                 |

  Scenario: Compute engagement KPIs from aggregated data
    Given aggregated event counts and durations for all sessions
    When KPI computation runs daily
    Then calculate:
      | KPI Name                           | Formula / Description                                                  |
      | Avg Session Length                 | total_session_time / total_sessions                                    |
      | Avg Recall Accuracy                | total_correct_recall / total_recall_attempts                            |
      | Avg Feedback View Rate             | total_feedback_views / total_questions_attempted                        |
      | Avg Leaderboard Position Δ         | (sum(position_change) / number_of_reporting_periods)                    |
      | Low Improvement Rate (%)           | (users_with_<5%_accuracy_gain / total_active_users) * 100               |
      | Return Rate (%)                    | (users_returned_within_period / total_users_in_cohort) * 100            |

  Scenario: Detect anomalies in aggregated metrics
    Given 30 days of historical data for each metric
    When today's value deviates more than 3σ from the historical mean
    Then flag it as an anomaly
    And tag the anomaly as either "performance" or "engagement"

  Scenario: Generate insights from anomalies
    Given flagged anomalies
    When insight generation runs
    Then recommend:
      | Domain       | Example Condition                               | Suggested Action                              |
      | Performance  | API latency spike > 30%                         | Review service profiling and DB optimization |
      | Engagement   | Low Improvement Rate rises above 25% threshold  | Review content adaptation algorithms         |
      | Engagement   | Return Rate drops below 60%                     | Trigger retention strategy review            |

  Scenario: Retrieve KPI and performance reports
    Given a request for a reporting period
    When processed
    Then return both engagement KPIs and DevOps performance metrics
    And include linked anomalies and insights
