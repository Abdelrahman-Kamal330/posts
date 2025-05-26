import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice.tsx";
import postReducer from "./postSlice.tsx";

const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postReducer,
  },
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
