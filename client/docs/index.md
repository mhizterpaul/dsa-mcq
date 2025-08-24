

# 📦 Core Components

This document outlines the core service responsibilities of the five primary components in the learning system. Each component operates independently, encapsulating its domain logic and workflows.

---

## 1. Learning Component (Adaptive Difficulty + Active Recall)

* Implements adaptive question selection using spaced repetition algorithms (e.g., SM-2, Leitner).
* Manages active recall workflows, enforcing retrieval before feedback.
* Generates detailed failure feedback including step-by-step reasoning and misconception identification.
* Tracks question difficulty progression based on user performance.
* Orchestrates session state management and practice scheduling.

---

## 2. Engagement Component (Habit-Forming Elements)

* Schedules and dispatches reminders and behavioral nudges to maintain user motivation.
* Manages gamification mechanics such as XP accumulation, streak tracking, and badge awarding.
* Processes user interaction events to update engagement status dynamically.
* Maintains engagement metrics to support personalized notification strategies.

---

## 3. Mediator Component (Central Orchestration Hub)

* Coordinates and orchestrates cross-component workflows and shared domain concerns.
* Manages component lifecycle events including UI loading and preloading strategies.
* Aggregates and routes data and event flows between components without violating modular boundaries.
* Maintains system-wide state consistency and mediation logging for traceability.

---

## 4. User Component (User Profile and Preferences)

* Manages user authentication and authorization states.
* Maintains comprehensive user models including preferences, mastery levels, and historical performance.
* Handles profile updates and synchronization of personalization inputs.
* Supports user goal tracking and settings management.

---

## 5. Analytics & Telemetry Component (Data-Driven Insights)

* Aggregates telemetry data from across the system for analysis.
* Computes key performance indicators (KPIs) and detects anomalies.
* Generates actionable insights to guide content improvements and adaptive algorithm tuning.
* Supports reporting and metric retrieval for continuous optimization efforts.

---
