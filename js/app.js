let state = {};


// DATA CONTROLLER

const searchController = (() => {

    let search = {};


    return {
        search: async function(query) {

            state.query = query;

            const baseURL = 'https://data.gov.au/data/api/3/action/datastore_search?resource_id=cb7e4eb5-ed46-4c6c-97a0-4532f4479b7d&q=';

            try {
                const result = await fetch(baseURL + query);
                const data = await result.json();
                state.search = data.result.records;
                state.search.forEach((el) => {
                    console.log(el["Company Name"]);
                })
            } catch (error) { alert('There was an error with your search') };

        }
    }
})();


// UI CONTROLLER

const UIController = (() => {

    const DOMStrings = {
        searchForm: '#searchForm',
        searchInput: '#searchInput',
        searchButton: '#searchButton',
        clearButton: '#clearButton'
    }


    return {
        getDOMStrings: function() {
            return DOMStrings;
        },

        clearInput: function() {
            document.querySelector(DOMStrings.searchInput).value = '';
        },

        getInput: function() {
            return document.querySelector(DOMStrings.searchInput).value;
        },

        setPlaceholder: function(value) {
            document.querySelector(DOMStrings.searchInput).placeholder = value;
        }
    }

})();


// APP CONTROLLER

const controller = ((searchCtrl, UICtrl) => {

    const DOM = UICtrl.getDOMStrings();

    const setupEventListeners = () => {

        document.querySelector(DOM.searchForm).addEventListener('submit', async(e) => {
            e.preventDefault();

            const input = UICtrl.getInput();

            if (input) {
                await searchCtrl.search(input);
                UICtrl.setPlaceholder(input);
                UICtrl.clearInput();

            }


        });

        document.querySelector(DOM.clearButton).addEventListener('click', () => {
            UICtrl.clearInput();
        })

    };

    return {
        init: function() {
            setupEventListeners();
        }
    }

})(searchController, UIController);

controller.init();