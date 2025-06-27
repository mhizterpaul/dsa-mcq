# 🧠 DSA-MCQ

**Think First. Code Later.**

**DSA-MCQ** is a **java springboot + Compose Multiplatform(offline mode on mobile)** mobile app that presents users with **interview-style data structure and algorithm (DSA) questions** in the form of multiple choice quizzes. The goal is to help users build strong problem-solving intuition by identifying the correct **approach, data structure, or algorithm** — before ever writing code.

This project is currently in its **early stages**. Questions are being added and refined during personal development time.

check if the question is an algorithm or data-structure focused question then use that knowledge to generate optins for the question

---

## 🎯 Why DSA-MCQ?

* 💡 Focus on **reasoning, not syntax**
* 🧱 Choose the best **approach**, **data structure**, or **optimization strategy**
* 🧠 Designed to **train intuition**, especially for tech interviews
* ❌ No code editor (yet) — just you, the problem, and your thought process

---

## 💡 Example Problems

### 🧭 Manhattan Distance with Edits

You're given a string `s` with directions: `'N'`, `'S'`, `'E'`, `'W'`. Each represents movement on a 2D grid.
You're allowed to change up to `k` of these characters.

What is the **maximum Manhattan distance** from the origin you can reach during this walk?

Which approach would work best?

* A. Brute-force simulate every possible edit
* B. Backtrack through all paths with a binary tree
* C. Use prefix sums and optimize position tracking ✅
* D. Use BFS on possible directions

---

### 📦 Design a Special Stack

> Design a stack that supports: `push(x)`, `pop()`, `top()`, and `getMin()` — **all in O(1) time**.

Which design allows all operations in constant time?

* A. Use a heap alongside the stack
* B. Store min value globally and update on each push
* C. Compose a second stack to track current mins ✅
* D. Sort elements on each push

These kinds of problems help you **compose and layer data structures** effectively — a core skill in interviews.

---

## 📱 Tech Stack

* **Language**: Kotlin
* **UI**: JetBrains Compose Multiplatform
* **Targets**: Android (primary), iOS & Desktop (planned)
* **Future Additions**: Java solutions for selected problems (when available)

---

## 🚧 Project Status

* 📌 Early-stage solo project
* 🧪 Questions added over time
* 📝 Multiple choice format only
* ❓ No code editor or leaderboard features
* 🎯 Core goal: help developers think better about **how** to solve problems

---

## 🤝 Contributing

Contributions are **very welcome**! You can help by:

* ✍️ Adding new multiple-choice DSA questions
* 🧠 Suggesting explanations and approaches
* 🧪 Reviewing or improving existing questions
* 💻 Helping with the Kotlin MPP UI or structure
* 🧾 Writing Java implementations for select problems

To contribute:

1. Fork the repo
2. Create a new branch: `feature/my-feature`
3. Commit your changes
4. Open a pull request with a short description

Feel free to open an issue if you want to discuss your idea before submitting a PR.

---

## 🛠️ Local Setup

```bash
git clone https://github.com/your-username/dsa-mcq.git
cd dsa-mcq
./gradlew build
./gradlew run
```

---

## 📚 Inspired By

* [@leetcodeblind75](https://www.youtube.com/@leetcodeblind75)
* Classic LeetCode and FAANG-style interview problems

---

**Think like an engineer. Solve like an interviewer.**
Start building your problem-solving mindset with **DSA-MCQ**.

