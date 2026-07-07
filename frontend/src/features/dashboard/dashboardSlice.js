// src/features/dashboard/dashboardSlice.js
import { createSlice } from "@reduxjs/toolkit";

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    loading: false,
    error: null,
    lastRefresh: null,
  },
  reducers: {
    setLoading: (state, action) => { state.loading = action.payload; },
    setError: (state, action) => { state.error = action.payload; },
    setRefresh: (state) => { state.lastRefresh = Date.now(); },
  },
});

export const { setLoading, setError, setRefresh } = dashboardSlice.actions;
export default dashboardSlice.reducer;
