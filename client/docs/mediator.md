Understood. Let me reframe this precisely with the **Mediator as the first-loaded central orchestrator**, respecting that each **component is a black box with its own UI and data**, and a UI may contain multiple such components.

---

# **Mediator Workflow**

## **Overview**

The **Mediator is the first thing loaded** — the central orchestrator managing UI composition, component coordination, and data access.

* **Mediator-first loading**: Mediator initializes before any UI or component.
* **UI composition**: Each UI consists of one or more independent, black-box components.
* **Component autonomy**: Each component encapsulates its own UI and data, fully self-contained.
* **User interaction**: Users interact with components directly.
* **Mediator’s role**: Coordinates loading, cross-component communication, and centralized quiz data retrieval — without invading component internals.

---

## **Workflow Steps**

1. **Mediator Initialization**

   * Mediator loads first at application start.
   * Prepares environment for UI and component orchestration.

2. **UI and Component Loading**

   * Mediator loads requested UI composed of multiple independent components.
   * Each component loads its own UI and manages its own data.
   * Components remain black boxes—Mediator does not access their internals.

3. **Component Autonomy**

   * Components operate fully independently for all local behavior and data management.
   * Components communicate only with Mediator for shared needs.

4. **Cross-Component and Shared Data Coordination**

   * Components request cross-component interactions or shared data (including quiz data) exclusively via Mediator.
   * Mediator acts as a message broker or data provider to facilitate these requests.
   * Mediator never breaches component encapsulation.

5. **Preloading**

   * Mediator manages asynchronous preloading of other UIs and components during idle times, optimizing responsiveness.

---

## **Mediator Responsibilities**

* Initialize before UI or components.
* Load and orchestrate multiple components within a UI.
* Serve as exclusive gateway for cross-component communication.
* Provide centralized access to shared resources such as quiz data.
* Respect component encapsulation—never interfere with internal logic.
* Manage asynchronous preloading for better performance.

---

## **Component Responsibilities**

* Fully encapsulate own UI and data.
* Handle all internal behavior autonomously.
* Communicate externally only through Mediator for:

  * Cross-component interactions.
  * Shared data requests (e.g., quiz data).
* Avoid direct coupling with other components.

---

## **Optimizations**

* Lazy-load critical UI components.
* Schedule non-critical preloading during idle times.
* Cache shared data (like quiz data) inside Mediator for efficiency.
* Batch requests to minimize communication overhead.
* Maintain strict boundaries between Mediator and components to avoid coupling.

---
