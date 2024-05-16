import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../config/supabaseClient';



// Thunk to fetch all habits
export const fetchHabits = createAsyncThunk('habits/fetchHabits', async () => {
  const { data, error } = await supabase.from('habits').select('*');
  if (error) throw error;
  return data;
});

const habitsSlice = createSlice({
  name: 'habits',
  initialState: {
    habits: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHabits.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchHabits.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.habits = action.payload;
      })
      .addCase(fetchHabits.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default habitsSlice.reducer;
