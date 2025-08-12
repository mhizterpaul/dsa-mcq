# 🧠 DSA-MCQ

**Think First. Code Later.**

**DSA-MCQ** ** 
mobile app that presents users with **interview-style data structure and algorithm (DSA) questions** in the form of multiple choice quizzes. The goal is to help users build strong problem-solving intuition by identifying the correct **approach, data structure, or algorithm** — before ever writing code.

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

## 🚧 Project Status

* 🧪 Questions added over time
* 📝 Multiple choice format only
* ❓ No code editor or leaderboard features
* 🎯 Core goal: help developers think better about **how** to solve problems

---

## 🤝 Contributing

Contributions are **very welcome**! You can help by:

* ✍️ Adding new multiple-choice DSA questions
* 🧠 Suggesting explanations and approaches

* 💻 Helping with the UI or structure
* 🧾 Writing typescript implementations for select problems

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

This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
