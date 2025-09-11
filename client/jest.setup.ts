import 'react-native-gesture-handler/jestSetup';

// 1. Mock react-native-sqlite-storage
jest.mock('react-native-sqlite-storage', () => {
  const mockDB = {
    executeSql: jest.fn().mockImplementation((sql, params, success, error) => {
      if (success) success([], []); // simulate empty result
      return Promise.resolve();
    }),
    transaction: jest.fn((cb) => cb({ executeSql: mockDB.executeSql })),
    close: jest.fn(),
  };

  return {
    openDatabase: jest.fn(() => mockDB),
  };
});

// 2. Mock PanGestureHandler & other gesture components
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native/Libraries/Components/View/View');
  return {
    PanGestureHandler: View,
    State: {},
    GestureHandlerRootView: View,
    TapGestureHandler: View,
    // add other gesture handlers if needed
  };
});

// 3. Mock React Navigation to avoid rendering real navigators
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
    useRoute: () => ({
      params: {},
    }),
  };
});
