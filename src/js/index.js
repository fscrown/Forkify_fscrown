import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import { elements, renderLoader, clearLoader } from './views/base';
import * as searchView from './views/searchViews';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';


/**global state of the app
 * Search object
 * current recipe object
 * shopping like object
 * liked recipes
 */
const state = {};
window.state = state;
/**
 * Search controller
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
// Recipe Controller
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
                if (state.Search) searchView.highlightSelector(id);
                //3 calculate time and servings
                state.recipe.calcTime();
                state.recipe.calcServings();
                // render recipe
                console.log(state.recipe);
                state.recipe.parseIngredients();
                recipeView.renderRecipe(
                    state.recipe,
                    state.Likes.isLiked(id)
                );
            } catch (error) {
                console.log(error);
            }
        }
    }
    // List Controller
const controlList = () => {
    if (!state.List) {
        state.List = new List();
    }
    state.recipe.ingredients.forEach(el => {
        const item = state.List.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
};


//Like Controller
const controlLike = () => {
    if (!state.Likes) state.Likes = new Likes();

    const currentID = state.recipe.id;
    if (!state.Likes.isLiked(currentID)) {
        const newLike = state.Likes.addLike(currentID, state.recipe.title, state.recipe.author, state.recipe.img);
        likesView.toggleLikebtn(true);
        likesView.renderLike(newLike);
        console.log(state.Likes);
    } else {
        state.Likes.deleteLike(currentID);
        console.log(state.Likes);
        likesView.toggleLikebtn(false);
        likesView.deleteLike(currentID);
    }
    likesView.toggleLikeMeu(state.Likes.getNumLikes());



}

//Restore liked recipes on page load 
window.addEventListener('load', () => {
    state.Likes = new Likes();
    state.Likes.readStorage();
    likesView.toggleLikeMeu(state.Likes.getNumLikes());
    state.Likes.likes.forEach(like => likesView.renderLike(like));

});


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
//
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;
    if (e.target.matches('.shopping__delete,.shopping__delete *')) {
        state.List.deleteItem(id);
        listView.deleteItem(id);
    } else if (e.target.matches('.shopping__count-value')) {
        const val = parseFloat(e.target.value, 10);
        state.List.updateCount(id, val);
    }
});
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
        }
        recipeView.updateIngredients(state.recipe);
    } else if (e.target.matches('.btn-increase ,.btn-increase *')) {
        state.recipe.updateServings('inc');
        recipeView.updateIngredients(state.recipe);
    } else if (e.target.matches('.recipe__btn--add,.recipe__btn--add *')) {
        controlList();
    } else if (e.target.matches('.recipe__love ,.recipe__love *')) {
        controlLike();
    };
});