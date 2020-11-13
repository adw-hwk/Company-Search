// DATA CONTROLLER

const searchController = (() => {
    let search = {};

    return {
        search: async(query) => {
            search.query = query;

            const baseURL =
                "https://data.gov.au/data/api/3/action/datastore_search?resource_id=cb7e4eb5-ed46-4c6c-97a0-4532f4479b7d&q=";

            try {
                const result = await fetch(baseURL + query);
                const data = await result.json();
                console.log(data.result);
                search.results = data.result.records;

                return data.result.records;
            } catch (error) {
                alert("There was an error with your search");
            }
        },

        sortResultsByDate: (results, oldestToNewest = true) => {
            return results.sort((cur, next) => {
                const curDate = cur["Date of Registration"];
                const nextDate = next["Date of Registration"];

                // Date format: DD/MM/YYYY

                // date object for current result
                const a = {
                    day: Number(curDate.slice(0, 2)),
                    month: Number(curDate.slice(3, 5)),
                    year: Number(curDate.slice(6)),
                };

                // date object for next result
                const b = {
                    day: Number(nextDate.slice(0, 2)),
                    month: Number(nextDate.slice(3, 5)),
                    year: Number(nextDate.slice(6)),
                };

                let sortCondition;

                // comparing date objects to determine whether a is more recent than b depending on oldestToNewest
                if (oldestToNewest) {
                    sortCondition =
                        a.year > b.year ||
                        (a.year === b.year && a.month > b.month) ||
                        (a.year === b.year && a.month === b.month && a.day > b.day);
                } else {
                    sortCondition =
                        a.year < b.year ||
                        (a.year === b.year && a.month < b.month) ||
                        (a.year === b.year && a.month === b.month && a.day < b.day);

                }
                return sortCondition ? 1 : -1;

            });
        },
    };
})();

// UI CONTROLLER

const UIController = (() => {
    const DOMStrings = {
        searchForm: "#searchForm",
        searchInput: "#searchInput",
        searchButton: "#searchButton",
        resultsList: "#resultsList",
        spinLoader: ".spinLoader"
    };

    const loader = () => {
        let el = document.createElement('div');
        el.classList.add('spinLoader');

        return el;
    };

    const card = {
        // - Company Name
        // - Current Name
        skeleton: () => {
            let card = document.createElement('div');
            card.classList.add('result-card');
            let cardTop = document.createElement('div');
            cardTop.classList.add('card-top');
            let cardBottom = document.createElement('div');
            cardBottom.classList.add('card-bottom');

            card.appendChild(cardTop);
            card.appendChild(cardBottom);

            return card;
        },
        top: (record) => {
            let HTML = '';

            if (record["Company Name"] !== null && record["Company Name"].length) {
                HTML += `<h2 class="comp-name">${record["Company Name"]} ${card.googleIcon(record)}</h2>`;
            }

            if (record["Current Name"] !== null && record["Current Name"].length) {
                HTML += `<small>Current Name:</small>`;
                HTML += `<h4 class="curr-name">${record["Current Name"]}</h4>`
            }

            return HTML;
        },

        detailsText: (record, field) => {

            let HTML = '';

            if (record[field] && record[field] !== '0') {
                HTML += `<div class="info-group"><div class="field">${field}</div><div class="value">${record[field]}</div></div>`
            }

            return HTML;

        },

        googleIcon: (record) => {

            return `<a target="_blank" style="margin-left: auto;" href="https://google.com/search?q=${record["Company Name"]}"><img class="google-icon" src="img/googleSearchIcon.png" height=40 width=40></a>`;

        }
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
        toggleLoader: () => {

            const resList = document.querySelector(DOMStrings.resultsList);
            let spinner = document.querySelector('.spinLoader');

            if (resList.contains(spinner)) {
                // remove loader
                resList.removeChild(spinner);
            } else {
                // add loader
                spinner = loader();
                resList.appendChild(spinner);
            }
        },
        renderResults: (results) => {
            const resultsList = document.querySelector(DOMStrings.resultsList);

            const infoKeys = [
                "Date of Registration",
                "ABN",
                "ACN",
                "Current Name Start Date",
                "Previous State of Registration",
                "Status",
                "Class",
                "Sub Class",
                "Type"
            ];

            resultsList.innerHTML = "";

            results.forEach((result) => {

                let shell = card.skeleton();

                const cardTop = shell.querySelector('.card-top');
                const cardBottom = shell.querySelector('.card-bottom');

                cardTop.innerHTML = card.top(result);

                infoKeys.forEach(key => {
                    cardBottom.innerHTML += card.detailsText(result, key);
                });

                resultsList.insertAdjacentElement('beforeend', shell);

            });
        },
        clearResults: () => {
            document.querySelector(DOMStrings.resultsList).innerHTML = '';
        },
        toTop: () => {
            window.scrollTo(0, 0);
        }
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
                    UICtrl.toTop();
                    UICtrl.clearResults();
                    UICtrl.toggleLoader();
                    const results = await searchCtrl.search(input);
                    UICtrl.setPlaceholder(input);
                    UICtrl.clearInput();

                    const sortedResults = searchCtrl.sortResultsByDate(results);
                    UICtrl.toggleLoader();
                    UICtrl.renderResults(sortedResults);
                }
            });
    };

    return {
        init: () => {
            setupEventListeners();
        },
    };
})(searchController, UIController);

controller.init();