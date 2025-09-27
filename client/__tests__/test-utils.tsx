import React, { ReactElement, PropsWithChildren } from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as StoreProvider } from 'react-redux';
import { configureStore, PreloadedState } from '@reduxjs/toolkit';
import type { AppStore, RootState } from '../src/store';

// Import the actual reducer
import userReducer from '../src/components/user/store/user.slice';

// This type extends the default options for render from RTL, as well
// as allows the user to specify other things such as initialState or a store.
interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: PreloadedState<RootState>;
  store?: AppStore;
}

export function setupStore(preloadedState?: PreloadedState<RootState>) {
  return configureStore({
    reducer: {
      user: userReducer,
    },
    preloadedState,
  });
}

export function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState = {},
    // Automatically create a store instance if no store was passed in
    store = setupStore(preloadedState),
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  function Wrapper({ children }: PropsWithChildren<{}>): JSX.Element {
    return (
      <StoreProvider store={store}>
        <PaperProvider>{children}</PaperProvider>
      </StoreProvider>
    );
  }

  // Return an object with the store and all of RTL's query functions
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

// re-export everything
export * from '@testing-library/react-native';
// override render method
export { renderWithProviders as render };