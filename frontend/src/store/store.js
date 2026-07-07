// src/store/store.js
import { configureStore } from "@reduxjs/toolkit";
import { dashboardApi } from "../features/dashboard/dashboardApi";
import dashboardReducer from "../features/dashboard/dashboardSlice";

export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(dashboardApi.middleware),
});

export default store;
