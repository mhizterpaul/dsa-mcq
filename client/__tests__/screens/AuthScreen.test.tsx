import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import AuthScreen from '../../src/screens/AuthScreen';
import * as userSlice from '../../src/components/user/store/user.slice';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

describe('AuthScreen', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      user: {
        loading: false,
        error: null,
        currentUser: null,
      },
    });
  });

  it('should dispatch loginUser action on login', () => {
    const loginUserSpy = jest.spyOn(userSlice, 'loginUser');
    const { getByPlaceholderText, getAllByText } = render(
      <Provider store={store}>
        <AuthScreen navigation={{ navigate: jest.fn() }} />
      </Provider>
    );

    fireEvent.changeText(getByPlaceholderText('Input your email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Input your password'), 'password123');
    fireEvent.press(getAllByText('Login')[1]);

    expect(loginUserSpy).toHaveBeenCalledWith({
      username: 'test@example.com',
      password: 'password123',
    });
  });

  it('should dispatch registerUser action on registration', () => {
    const registerUserSpy = jest.spyOn(userSlice, 'registerUser');
    const { getByPlaceholderText, getAllByText } = render(
      <Provider store={store}>
        <AuthScreen navigation={{ navigate: jest.fn() }} />
      </Provider>
    );

    fireEvent.press(getAllByText('Register')[0]);
    fireEvent.changeText(getByPlaceholderText('Input your email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Input your password'), 'password123');
    fireEvent.changeText(getByPlaceholderText('Confirm your password'), 'password123');
    fireEvent.press(getAllByText('Register')[1]);

    expect(registerUserSpy).toHaveBeenCalledWith({
      username: 'test@example.com',
      email: 'test@example.com',
      password: 'password123',
    });
  });
});
