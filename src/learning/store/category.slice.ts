import { createSlice, createEntityAdapter, PayloadAction } from '@reduxjs/toolkit';
import { Category } from './primitives/Category';

const categoriesAdapter = createEntityAdapter<Category>({
  selectId: (category) => category.id,
});

const categorySlice = createSlice({
  name: 'categories',
  initialState: categoriesAdapter.getInitialState(),
  reducers: {
    addCategory: (state, action: PayloadAction<{ id: string; name: string; masteryScore?: number }>) => {
      const { id, name, masteryScore } = action.payload;
      const newCategory = new Category(id, name, masteryScore);
      categoriesAdapter.addOne(state, { ...newCategory });
    },
    addCategories: (state, action: PayloadAction<{ id: string; name: string; masteryScore?: number }[]>) => {
      const newCategories = action.payload.map(({ id, name, masteryScore }) => {
        const newCategory = new Category(id, name, masteryScore);
        return { ...newCategory };
      });
      categoriesAdapter.addMany(state, newCategories);
    },
    updateCategory: categoriesAdapter.updateOne,
    removeCategory: categoriesAdapter.removeOne,
    setCategories: (state, action: PayloadAction<{ id: string; name: string; masteryScore?: number }[]>) => {
        const newCategories = action.payload.map(({ id, name, masteryScore }) => {
            const newCategory = new Category(id, name, masteryScore);
            return { ...newCategory };
        });
        categoriesAdapter.setAll(state, newCategories);
    },
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
