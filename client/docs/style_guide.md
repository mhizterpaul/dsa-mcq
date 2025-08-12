# Developer Style Guide — DSA-MCQ Architecture Principles

### 1. **Architectural Layers & Responsibilities**

* **Service Layer**

  * Owns business logic, validation, authentication, authorization, and workflow orchestration.
  * Follows **Single Responsibility Principle (SRP)** and **Open/Closed Principle (OCP)** for modular extensibility.
  * Uses Data Layer for raw data aggregation, never manipulating raw data directly.

* **Data Layer**

  * Aggregates and provides raw or semi-processed data on request.
  * Contains no business logic.
  * Adheres to **Dependency Inversion Principle (DIP)** by abstracting data sources.

---

### 2. **Component Interface Guidelines**

* Components expose **discrete lifecycle methods** for both non-UI and UI concerns:

  * `loadX()`, `loadY()`, ... — distinct background/non-UI processes (data fetch, validation, computation).
  * `renderX()`, `renderY()`, ... — distinct UI rendering or view update tasks.
* These methods are **exclusively invoked by the Mediator**, not by external clients or other components.
* Interfaces adhere to **Interface Segregation Principle (ISP)**, exposing only necessary methods per component.

---

### 3. **Mediator Interface Guidelines**

* The **Mediator is the single source of truth and central registry for all component lifecycle methods**:

  * Registers all components and tracks their exposed `loadX()`, `loadY()`, `renderX()`, `renderY()` methods.
  * Implements `initiate()` to reset or start workflows.
  * Controls strict sequencing:

    ```
    initiate();
    loadX();   // invokes loadX on all registered components
    loadY();   // invokes loadY on all registered components
    renderX(); // invokes renderX on all registered components
    renderY(); // invokes renderY on all registered components
    ```
  * Ensures components remain **loosely coupled and unaware of each other**, only the mediator manages orchestration.

---

### 4. **Naming Conventions & Enforcement**

* Explicit method names (`loadX()`, `renderY()`, etc.) reflect distinct lifecycle phases.
* Mediator interfaces declare and invoke these methods consistently.
* Enforce naming and sequencing via:

  * Interfaces or abstract base classes with explicit method declarations.
  * Static analysis (e.g., ESLint, Checkstyle) and code reviews.
  * Avoid overly rigid tooling; focus on pragmatic enforcement.

---

### 5. **Additional Design Principles**

* **KISS:** Keep methods focused and simple.
* **SRP:** One responsibility per method/component.
* **Separation of Concerns:** Separate UI rendering from business logic clearly.
* **Testability:** `load*()` methods should be testable independently of UI.
* **Extensibility:** Design to add new lifecycle methods without breaking contracts.
* **Open/Closed Principle (OCP):** Components open for extension, closed for modification.

---

### 6. **Algorithmic Rigor & When to Build**

* Favor classical, well-understood algorithms optimized for your domain.
* Use standard data structures and build from first principles when performance or clarity demands.
* Adopt third-party libraries only if:

  * Proven and well-maintained.
  * Avoid introducing heavy dependencies or side effects.
  * Provide clear time/effort savings.
* Document custom algorithm implementations, complexity, and trade-offs thoroughly.

---

### 7. **Library Recommendations (Minimal & Judicious for React Native / Node.js)**

* Use minimal, proven libraries compatible with React Native/Node.js:

  * [`jsonwebtoken`](https://github.com/auth0/node-jsonwebtoken) for JWT handling.
  * [`lodash`](https://lodash.com/) selectively for utility functions.
  * Native APIs or minimal wrappers for networking (e.g., `fetch`).
* Avoid dependency bloat; prefer your own implementations where feasible and sensible.

---

