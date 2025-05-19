import { configureStore } from "@reduxjs/toolkit";
import store from "../store.tsx";
import authReducer from "../authSlice.tsx";
import postReducer from "../postSlice.tsx";

// Mock configureStore
jest.mock("@reduxjs/toolkit", () => ({
  ...jest.requireActual("@reduxjs/toolkit"),
  configureStore: jest.fn(() => ({
    getState: jest.fn(),
    dispatch: jest.fn(),
  })),
}));

describe("Redux Store", () => {
  it("configures the store with the correct reducers", () => {
    expect(configureStore).toHaveBeenCalledWith({
      reducer: {
        auth: authReducer,
        posts: postReducer,
      },
    });
  });

  it("exports the store instance", () => {
    expect(store).toBeDefined();
    expect(store.getState).toBeDefined();
    expect(store.dispatch).toBeDefined();
  });
});
