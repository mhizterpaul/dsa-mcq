import 'react-native-gesture-handler/jestSetup';
import '@testing-library/jest-native/extend-expect';

// Mock native animated helper to prevent animation-related errors
jest.mock('react-native/src/private/animated/NativeAnimatedHelper');