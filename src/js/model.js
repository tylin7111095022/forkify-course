import { async } from 'regenerator-runtime';
import { API_URL, ITEMS_EVERY_PAGE, KEY } from './config.js';
import { AJAX } from './helper.js';

const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    resultPerPage: ITEMS_EVERY_PAGE,
    page: 1,
  },
  bookmarks: [],
};

const createRecipeObject = function (data) {
  const { recipe } = data.data;
  // console.log(recipe);

  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    ...(recipe.key && { key: recipe.key }),
  };
};
const loadRecipe = async function (id) {
  try {
    const data = await AJAX(`${API_URL}/${id}?key=${KEY}`);
    state.recipe = createRecipeObject(data);
    // console.log(res, data);

    if (state.bookmarks.some(bookmark => bookmark.id === id)) {
      state.recipe.bookmarked = true;
    } else {
      state.recipe.bookmarked = false;
    }

    // console.log(state.recipe);
  } catch (err) {
    console.error(`${err}💥💥💥`);
    throw err;
  }
};

const loadSearchResults = async function (query) {
  try {
    state.search.query = query;
    const data = await AJAX(`${API_URL}/?search=${query}&key=${KEY}`);

    state.search.results = data.data.recipes.map(rec => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
        ...(rec.key && { key: rec.key }),
      };
    });
    state.search.page = 1;
    // console.log(state.search.results);
  } catch (err) {
    console.error(`${err}💥💥💥`);
    throw err;
  }
};

const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page;
  if (page <= 0) return [];
  const start = ITEMS_EVERY_PAGE * (page - 1);
  const end = ITEMS_EVERY_PAGE * page;
  return state.search.results.slice(start, end);
};

const updateServings = function (newservings) {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = (ing.quantity * newservings) / state.recipe.servings;
  });
  state.recipe.servings = newservings;
};

const persistBookmarks = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

const addBookMark = function (recipe) {
  // Add bookmark
  state.bookmarks.push(recipe);

  // Mark current recipe as bookmark
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;

  persistBookmarks();
};

const removeBookMark = function (id) {
  // Delete bookmark
  const index = state.bookmarks.findIndex(el => {
    el.id === id;
  });
  state.bookmarks.splice(index, 1);
  // Mark current recipe as NOT bookmark
  if (id === state.recipe.id) state.recipe.bookmarked = false;

  persistBookmarks();
};

const initBookmarks = function () {
  const storage = localStorage.getItem('bookmarks');
  if (storage) state.bookmarks = JSON.parse(storage);
};

const clearBookmarks = function () {
  localStorage.clear('bookmarks');
};

initBookmarks();
// clearBookmarks();

const uploadRecipe = async function (newRecipe) {
  try {
    const ingredients = Object.entries(newRecipe)
      .filter(entry => {
        return entry[0].startsWith('ingredient') && entry[1] !== '';
      })
      .map(ing => {
        const ingArr = ing[1].split(',').map(el => el.trim());
        if (ingArr.length !== 3)
          throw new Error(
            'Wrong ingredient format! Please use the correct format :)'
          );
        const [quantity, unit, description] = ingArr;
        return { quantity: quantity ? +quantity : null, unit, description };
      });

    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients: ingredients,
    };
    // console.log(recipe);
    const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
    state.recipe = createRecipeObject(data);
    // console.log(data);
    addBookMark(state.recipe);
  } catch (err) {
    throw err;
  }
};

export {
  state,
  loadRecipe,
  loadSearchResults,
  getSearchResultsPage,
  updateServings,
  addBookMark,
  removeBookMark,
  uploadRecipe,
};
