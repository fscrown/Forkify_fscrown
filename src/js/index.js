import Search from './models/Search';
import * as searchView from './views/searchViews';
import { elements, renderLoader, clearLoader } from './views/base';
import Recipe from './models/Recipe';
import * as recipeView from './views/recipeView';
/**global state of the app
 * Search object
 * current recipe object
 * shopping like object
 * liked recipes
 */
const state = {};
/**
 * Search co 
 */
const controlSearch = async() => {
    //1 Get query from Search view
    const query = searchView.getInput();
    console.log(query);
    if (query) {
        // 2 New search object and add to state
        state.Search = new Search(query);
        // 3 prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);
        // 4 Search for recipes
        try {
            await state.Search.getResults();
            clearLoader();
            //5 render results on UI
            searchView.renderResults(state.Search.result);
        } catch (error) {
            console.log('something went wrong with search ... :(');
            clearLoader();

        }
    }
};

const controlRecipe = async() => {
    //Get ID from URL
    const id = window.location.hash.replace('#', '');

    if (id) {

        //  1 create new Recipe object
        renderLoader(elements.recipe);
        state.recipe = new Recipe(id);


        try {
            // 2 get Recipe data
            await state.recipe.getRecipe();
            clearLoader();
            recipeView.clearRecipe();

            //3 calculate time and servings
            state.recipe.calcTime();
            state.recipe.calcServings();
            // render recipe
            state.recipe.parseIngredients();
            recipeView.renderRecipe(state.recipe);

        } catch (error) {
            console.log(error);


        }




    }




}



elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});
elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.Search.result, goToPage);
    }
});
['hashchange', 'load'].forEach(event => addEventListener(event, controlRecipe));