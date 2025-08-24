# 📊 Anomaly Detection Pipeline

## 1. **AUTHENTICITY**

**Purpose:** Detect tampering, app cloning, signature mismatch.
**Where:** Native agent (device-level, C++ preferred).

* **Step 1: Signature Verification**

  * **Android:** Use `PackageManager` via JNI → compare runtime signature against known SHA-256.
  * **iOS:** Use `SecCodeCheckValidity` or validate embedded provisioning profile.
  * C++ can call into native OS APIs via JNI/Objective-C++ bindings.
* **Computation:**

  * `expected_signature_hash != runtime_signature_hash → AnomalyType.AUTHENTICITY`.

---

## 2. **SECURITY\_BREACH**

**Purpose:** Detect privilege escalation, auth bypass, multiple session inconsistencies.
**Where:** Mediator + Analytics.

* **Step 1: Session Consistency**

  * Ask Mediator: `activeSessionId`, `lastKnownSessionId`.
  * If mediator reports session mismatch → flag.
* **Step 2: Multi-device / token replay**

  * Mediator → “last login device fingerprint”.
  * Compare to current device → mismatch indicates breach.
* **Computation:**

  * `sessionState.app != sessionState.server` → `SECURITY_BREACH`.

---

## 3. **RESOURCE\_DEFICIENCY**

**Purpose:** Device low on RAM, overheating, storage full.
**Where:** Native agent (C++).

* **Step 1: Memory Metrics**

  * **Linux/Android:** `/proc/meminfo` (parse `MemAvailable`).
  * **Windows:** `GlobalMemoryStatusEx`.
  * **iOS:** `task_vm_info` via `mach_task_basic_info`.
  * Threshold: `< 1GB free RAM → RESOURCE_DEFICIENCY`.
* **Step 2: Storage Metrics**

  * **POSIX:** `statvfs` for free/total disk space.
  * Threshold: `< 1GB free storage`.
* **Step 3: CPU & Battery**

  * CPU: `std::thread::hardware_concurrency()` + `/proc/stat`.
  * Battery: Android `BatteryManager`, iOS `UIDevice.batteryLevel`.
* **Computation:**

  * `(ram_free < 1GB || storage_free < 1GB || temp > threshold) → RESOURCE_DEFICIENCY`.

---

## 4. **API\_ABNORMALITY**

**Purpose:** Detect request floods, click bots, random spam.
**Where:** Mediator + Analytics.

* **Step 1: Event Collection**

  * Mediator reports per-user:

    * Click events/sec
    * API requests/sec
    * Endpoint frequency distribution
* **Step 2: Baseline Modeling**

  * Typical human rate: `2–3 clicks/sec` sustained.
  * Anything `> 10 clicks/sec sustained` = suspicious.
  * Abnormal request pattern = high entropy in endpoint access distribution.
* **Step 3: Anomaly Detection**

  * Simple moving average + z-score.
  * Example: `if rate > mean + 3*stddev → API_ABNORMALITY`.

---

## 5. **GAMEPLAY\_FRAUD**

**Purpose:** Detect unrealistic quiz/game completion speed or performance jumps.
**Where:** Mediator (session + component state).

* **Step 1: Expected Completion Time**

  * From mediator: quiz metadata = `20 questions, 45s each`.
  * Expected range = \~15min.
* **Step 2: Actual Session Data**

  * Mediator: `questions_attempted`, `time_taken`, `score`.
* **Step 3: Fraud Rule**

  * If `completion_time << expected_min_time` → fraud.

    * Example: `20Q finished in < 2 min` = bot/cheating.
  * If `accuracy >> baseline` + `speed >> baseline` → suspicious.
* **Computation:**

  * `(completionTime < threshold || accuracy spike unnatural) → GAMEPLAY_FRAUD`.

---

# 🔧 Tooling & Implementation

### Native Agent (C++/NDK)

* Use **C++17** for portability.
* Android: `ndk::` system APIs + `/proc` parsing.
* iOS: Objective-C++ bridges (`mach`, `sysctl`, `statvfs`).
* Recommended wrappers:

  * [`libstatgrab`](https://libstatgrab.org/) (cross-platform system stats).
  * [`Boost.Process`](https://www.boost.org/) if you need controlled system calls.

### Mediator

* React Native JS/TS side + bridge for state exposure.
* Expose:

  * `UserSessionSnapshot`
  * `ComponentSnapshot`
  * Event stream (`onClick`, `onSubmit`, etc.).

### Analytics

* Written in TS/Node side or even embedded WASM.
* Apply statistical rules or ML anomaly detection.
* Stores thresholds, historical baselines.

---

✅ This setup keeps your **metrics pipeline clean**:

* **C++ agent** → raw device numbers (RAM, CPU, storage).
* **Mediator** → app/user/component state.
* **Analytics** → judgments (map to `AnomalyType`).

