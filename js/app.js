let state = {};

// DATA CONTROLLER

const searchController = (() => {
    let search = {};

    return {
        search: async(query) => {
            state.query = query;

            const baseURL =
                "https://data.gov.au/data/api/3/action/datastore_search?resource_id=cb7e4eb5-ed46-4c6c-97a0-4532f4479b7d&q=";

            try {
                const result = await fetch(baseURL + query);
                const data = await result.json();
                state.search = data.result.records;
                // state.search.forEach((el) => {
                //     console.log(el["Company Name"]);
                // })
                return data.result;
            } catch (error) {
                alert("There was an error with your search");
            }
        },

        stringToDate: (dateString) => {
            // expected dateString format DD/MM/YYYY
            // crude validation of input date string, improve later
            if (
                dateString.length === 10 &&
                dateString[2] === "/" &&
                dateString[5] === "/"
            ) {

                try {
                    const dateArr = dateString.split("/");

                    // required format for Date() - MM-DD-YYYY (why? idk, because America I suppose)
                    // MM - dateArr[1], MM - dateArr[0], YYYY - dateArr[2]
                    const regDate = new Date(`${dateArr[1]}-${dateArr[0]}-${dateArr[2]}`);

                    return regDate;
                } catch (e) {
                    console.warn(e);
                    return false;
                }

            } else {
                console.warn('Date string format doesn\'t match DD/MM/YYYY');
                return false;
            }
        },

        // searchControllers own stringToDate function (above) is passed as converterFunc argument in the form submit event listener inside app controller
        sortResultsByDate: (results, converterFunc, oldestToNewest = true) => {

            if (oldestToNewest) {
                return results.sort((cur, next) => {
                    return converterFunc(cur["Date of Registration"]).getTime() > converterFunc(next["Date of Registration"]).getTime() ? 1 : -1
                });
            } else {
                return results.sort((cur, next) => {
                    return converterFunc(cur["Date of Registration"]).getTime() < converterFunc(next["Date of Registration"]).getTime() ? 1 : -1
                });
            }

        },
    };
})();

// UI CONTROLLER

const UIController = (() => {
    const DOMStrings = {
        searchForm: "#searchForm",
        searchInput: "#searchInput",
        searchButton: "#searchButton",
        clearButton: "#clearButton",
        resultsList: "#resultsList",
    };

    return {
        getDOMStrings: () => {
            return DOMStrings;
        },

        clearInput: () => {
            document.querySelector(DOMStrings.searchInput).value = "";
        },

        getInput: () => {
            return document.querySelector(DOMStrings.searchInput).value;
        },

        setPlaceholder: (value) => {
            document.querySelector(DOMStrings.searchInput).placeholder = value;
        },
        renderResults: (results) => {
            const resultsList = document.querySelector(DOMStrings.resultsList);

            resultsList.innerHTML = "";

            results.forEach((result) => {
                let li = `<li class="result-card"><h2 class="company-name">${result["Company Name"]}<a target="_blank" href="https://google.com/search?q=${result["Company Name"]}"><i class="fab fa-google"></i></a></h2><div>Date of Registration: <span class="bold">${result["Date of Registration"]}</span></div><div>ABN: <span class="bold">${result["ABN"]}</span></div></li>`;
                resultsList.innerHTML += li;
            });
        },
    };
})();

// APP CONTROLLER

const controller = ((searchCtrl, UICtrl) => {
    const DOM = UICtrl.getDOMStrings();

    const setupEventListeners = () => {
        document
            .querySelector(DOM.searchForm)
            .addEventListener("submit", async(e) => {
                e.preventDefault();

                const input = UICtrl.getInput();

                if (input) {
                    const result = await searchCtrl.search(input);
                    UICtrl.setPlaceholder(input);
                    UICtrl.clearInput();

                    const sortedResults = searchCtrl.sortResultsByDate(result.records, searchCtrl.stringToDate);
                    UICtrl.renderResults(sortedResults);
                }
            });

        document.querySelector(DOM.clearButton).addEventListener("click", () => {
            UICtrl.clearInput();
        });
    };

    return {
        init: () => {
            setupEventListeners();
        },
    };
})(searchController, UIController);

controller.init();