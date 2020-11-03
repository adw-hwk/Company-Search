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

        getSearch: () => {
            return search;
        },

        // stringToDate: (dateString) => {
        //     // expected dateString format DD/MM/YYYY
        //     // crude validation of input date string, improve later
        //     if (
        //         dateString.length === 10 &&
        //         dateString[2] === "/" &&
        //         dateString[5] === "/"
        //     ) {

        //         try {
        //             const dateArr = dateString.split("/");

        //             // required format for Date() - MM-DD-YYYY (why? idk, because America I suppose)
        //             // MM - dateArr[1], MM - dateArr[0], YYYY - dateArr[2]
        //             const regDate = new Date(`${dateArr[1]}-${dateArr[0]}-${dateArr[2]}`);

        //             return regDate;
        //         } catch (e) {
        //             console.warn(e);
        //             return false;
        //         }

        //     } else {
        //         console.warn('Date string format doesn\'t match DD/MM/YYYY');
        //         return false;
        //     }
        // },

        // searchControllers own stringToDate function (above) is passed as converterFunc argument in the form submit event listener inside app controller

        sortResultsByDate: (results, oldestToNewest = true) => {
            return results.sort((cur, next) => {
                const curDate = cur["Date of Registration"];
                const nextDate = next["Date of Registration"];

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
    };

    const card = {
        // - Company Name
        // - Current Name
        title: (record) => {
            let HTML = '';

            if (record["Company Name"] !== null && record["Company Name"].length) {
                HTML += `<h2 class="company-name">${record["Company Name"]}</h2>`;
            }

            if (record["Current Name"] !== null && record["Current Name"].length) {
                HTML += `<h4 class="current-name">${record["Current Name"]} <em><small>(Current name)</small></em></h4>`;
            }

            return HTML;
        },

        detailsText: (record, field) => {

            let HTML = '';

            if (record[field]) { HTML += `<div>${field}: <span class="bold">${record[field]}</span></div>` }

            return HTML;

        },

        googleIcon: (record) => {

            return `<a target="_blank" style="margin-left: auto;" href="https://google.com/search?q=${record["Company Name"]}"><img class="google-icon" src="dist/img/googleSearchIcon.png" height=40 width=40></a>`;

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

                let cardHTML = '';
                let titleHTML = card.title(result);
                let infoHTML = '';
                let googleHTML = card.googleIcon(result);

                infoKeys.forEach((key) => { if (result[key]) { infoHTML += card.detailsText(result, key) } });

                cardHTML = `<div class="result-card">${titleHTML + infoHTML + googleHTML}</div>`

                resultsList.innerHTML += cardHTML;

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
                    const results = await searchCtrl.search(input);
                    UICtrl.setPlaceholder(input);
                    UICtrl.clearInput();

                    const sortedResults = searchCtrl.sortResultsByDate(results);
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