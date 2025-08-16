## 1. **APP\_STARTUP\_TIME**

**Goal:** Measure cold start (fresh app open) and warm start (resume from background).

**Steps:**

1. Mark `T₀` in `index.js` — right before you call `AppRegistry.registerComponent`.

   * Use `performance.now()` or `Date.now()`.
2. Mark `T₁` when your root component (e.g., `<App />`) finishes mounting.

   * Use `useEffect(() => { ... }, [])` in your root component.
3. Compute `coldStart = T₁ − T₀`.
4. For **warm start**, listen to `AppState` (`change` event).

   * Mark `T₂` when app returns to `active`.
   * Mark `T₃` after the root screen re-renders.
   * Compute `warmStart = T₃ − T₂`.

✅ **Tools:** `performance.now()`, `AppState`, `useEffect`.

---

## 2. **HYDRATION\_LATENCY**

**Goal:** Time spent preparing data for the UI (local DB, API, cache).

**Steps:**

1. Mark `H₀` just before calling your hydration function (DB read / API fetch).
2. Mark `H₁` immediately after the data is ready and inserted into state/context.
3. Compute `duration = H₁ − H₀`.
4. Tag source as `"local_db" | "remote_api" | "cache"`.

✅ **Tools:** `performance.now()`, wrap your DB/API fetchers (e.g., SQLite, WatermelonDB, AsyncStorage, fetch).

---

## 3. **COMPONENT\_RENDER\_TIME**

**Goal:** Time to mount and commit a heavy screen/component.

**Steps:**

1. Mark `R₀` at the very start of render.

   * Use `useLayoutEffect(() => { start = performance.now(); }, [])`.
2. Mark `R₁` after the component commits.

   * Use `useEffect(() => { end = performance.now(); }, [])`.
3. Compute `duration = R₁ − R₀`.
4. Add metadata: `componentName`, `phase = "mount"`.
5. **Throttle**: only measure top-level screens or expensive UI.

✅ **Tools:** `useLayoutEffect`, `useEffect`, `performance.now()`.

---

## 4. **NETWORK\_CONDITION**

**Goal:** Track latency, throughput, and packet loss.

**Steps:**

1. Wrap all network calls with timing logic:

   * Mark `N₀` before fetch starts.
   * Mark `N₁` after response headers received.
   * Compute `latency = N₁ − N₀`.
2. Throughput: `bytesReceived / duration`.

   * Use `response.headers.get('content-length')`.
3. Packet loss: approximate by retry counts or failed connections.

   * Track % of failed requests vs total.
4. Optionally use RN’s `NetInfo` to capture network type + strength.

✅ **Tools:** `fetch`, `performance.now()`, `NetInfo` (`@react-native-community/netinfo`).

---

## 5. **CRASH**

**Goal:** Log uncaught errors & fatal crashes.

**Steps:**

1. Install a global JS error handler with `ErrorUtils.setGlobalHandler`.
2. For native crashes, use `react-native-exception-handler` or `react-native-crashlytics`.
3. On crash: capture `error.message`, `stackTrace`, `severity`.
4. Send when app restarts (buffer logs locally before flush).

✅ **Tools:** `ErrorUtils`, `react-native-exception-handler`, Firebase Crashlytics.

---

## 6. **ERROR**

**Goal:** Capture handled errors in the app.

**Steps:**

1. Wrap try/catch around risky flows (API, hydration, navigation).
2. On error, record: `errorCode`, `message`, `severity`.
3. Throttle repeated errors (avoid flooding).

✅ **Tools:** native JS try/catch, global logging wrapper.

---

⚡ **Key Principles Across All Metrics:**

* Always use `performance.now()` (higher resolution than `Date.now()`) — supported on RN iOS + Android.
* Throttle profiler-style metrics (render time, hydration) to avoid spam.
* Buffer locally, flush in batches (e.g., every 30s or on background).

---

👉 Mr. Paul, want me to draft a **minimal RN utility hook** (like `useMetricLogger`) that wraps these steps in one place so you don’t sprinkle `performance.now()` everywhere?
