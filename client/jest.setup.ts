import 'react-native-gesture-handler/jestSetup';
import '@testing-library/jest-native/extend-expect';
import 'whatwg-fetch';

// Mock the native animated helper to prevent tests from crashing due to animations
// that are not properly handled in the test environment.
jest.mock('react-native/src/private/animated/NativeAnimatedHelper');