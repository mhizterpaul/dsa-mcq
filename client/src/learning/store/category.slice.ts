import {
  createSlice,
  createEntityAdapter,
  PayloadAction,
  createAsyncThunk,
  Update,
} from '@reduxjs/toolkit';
import { Category } from './primitives/Category';
import { sqliteService } from '../../common/services/sqliteService';
import { syncService } from '../../common/services/syncService';
import { AppDispatch } from '../../mediator/store';

// --- ENTITY ADAPTER ---
const categoriesAdapter = createEntityAdapter<Category>({
  selectId: (category) => category.id,
});

// --- ASYNC THUNKS ---

/**
 * Hydrates the categories state from the SQLite database.
 */
export const hydrateCategories = createAsyncThunk<Category[], void, { dispatch: AppDispatch }>(
  'categories/hydrate',
  async (_, thunkAPI) => {
    const categories = await sqliteService.getAll('categories');

    await syncService.performSync(thunkAPI.dispatch);

    const syncedCategories = await sqliteService.getAll('categories');
    return syncedCategories as Category[];
  },
);

/**
 * Adds a new category to the database and then to the state.
 */
export const addCategoryDb = createAsyncThunk<
  Category,
  { name: string; id: string; masteryScore?: number }
>('categories/addCategoryDb', async ({ id, name, masteryScore }) => {
  const newCategory = new Category(id, name, masteryScore);
  const categoryToSave = { ...newCategory, updatedAt: Date.now(), is_dirty: 1 };
  await sqliteService.create('categories', categoryToSave);
  return newCategory;
});

/**
 * Updates a category in the database and then in the state.
 */
export const updateCategoryDb = createAsyncThunk<
  Update<Category>,
  Update<Category>
>('categories/updateCategoryDb', async (update) => {
  const payload = { ...update.changes, is_dirty: 1 };
  await sqliteService.update('categories', update.id as string, payload);
  return update;
});

/**
 * Removes a category from the database and then from the state.
 */
export const removeCategoryDb = createAsyncThunk<string, string>(
  'categories/removeCategoryDb',
  async (categoryId) => {
    await sqliteService.delete('categories', categoryId);
    return categoryId;
  },
);

// --- SLICE DEFINITION ---
const categorySlice = createSlice({
  name: 'categories',
  initialState: categoriesAdapter.getInitialState({
    loading: 'idle',
  }),
  reducers: {
    // These reducers are now for non-DB state changes if needed.
    // For DB operations, use the async thunks.
    addCategory: categoriesAdapter.addOne,
    updateCategory: categoriesAdapter.updateOne,
    removeCategory: categoriesAdapter.removeOne,
    setCategories: categoriesAdapter.setAll,
  },
  extraReducers: (builder) => {
    builder
      .addCase(hydrateCategories.fulfilled, (state, action: PayloadAction<Category[]>) => {
        categoriesAdapter.setAll(state, action.payload);
        state.loading = 'succeeded';
      })
      .addCase(addCategoryDb.fulfilled, (state, action: PayloadAction<Category>) => {
        categoriesAdapter.addOne(state, action.payload);
      })
      .addCase(updateCategoryDb.fulfilled, (state, action: PayloadAction<Update<Category>>) => {
        categoriesAdapter.updateOne(state, action.payload);
      })
      .addCase(removeCategoryDb.fulfilled, (state, action: PayloadAction<string>) => {
        categoriesAdapter.removeOne(state, action.payload);
      });
  },
});

export const { addCategory, updateCategory, removeCategory, setCategories } =
  categorySlice.actions;

export default categorySlice.reducer;
