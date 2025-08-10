import { createSlice, createEntityAdapter, PayloadAction } from '@reduxjs/toolkit';
import { Category } from '../interface';

const categoriesAdapter = createEntityAdapter<Category>({
  selectId: (category) => category.id,
});

const categorySlice = createSlice({
  name: 'categories',
  initialState: categoriesAdapter.getInitialState(),
  reducers: {
    addCategory: categoriesAdapter.addOne,
    addCategories: categoriesAdapter.addMany,
    updateCategory: categoriesAdapter.updateOne,
    removeCategory: categoriesAdapter.removeOne,
    setCategories: categoriesAdapter.setAll,
  },
});

export const {
  addCategory,
  addCategories,
  updateCategory,
  removeCategory,
  setCategories,
} = categorySlice.actions;

export default categorySlice.reducer;
