"use strict";

// DATA CONTROLLER
var searchController = function () {
  var _search = {};
  return {
    search: async function search(query) {
      _search.query = query;
      var baseURL = "https://data.gov.au/data/api/3/action/datastore_search?resource_id=cb7e4eb5-ed46-4c6c-97a0-4532f4479b7d&q=";

      try {
        var result = await fetch(baseURL + query);
        var data = await result.json();
        _search.results = data.result.records;
        return data.result.records;
      } catch (error) {
        alert("There was an error with your search");
      }
    },
    getSearch: function getSearch() {
      return _search;
    },
    stringToDate: function stringToDate(dateString) {
      // expected dateString format DD/MM/YYYY
      // crude validation of input date string, improve later
      if (dateString.length === 10 && dateString[2] === "/" && dateString[5] === "/") {
        try {
          var dateArr = dateString.split("/"); // required format for Date() - MM-DD-YYYY (why? idk, because America I suppose)
          // MM - dateArr[1], MM - dateArr[0], YYYY - dateArr[2]

          var regDate = new Date("".concat(dateArr[1], "-").concat(dateArr[0], "-").concat(dateArr[2]));
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
    sortResultsByDate: function sortResultsByDate(results, converterFunc) {
      var oldestToNewest = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

      if (oldestToNewest) {
        return results.sort(function (cur, next) {
          return converterFunc(cur["Date of Registration"]).getTime() > converterFunc(next["Date of Registration"]).getTime() ? 1 : -1;
        });
      } else {
        return results.sort(function (cur, next) {
          return converterFunc(cur["Date of Registration"]).getTime() < converterFunc(next["Date of Registration"]).getTime() ? 1 : -1;
        });
      }
    }
  };
}(); // UI CONTROLLER


var UIController = function () {
  var DOMStrings = {
    searchForm: "#searchForm",
    searchInput: "#searchInput",
    searchButton: "#searchButton",
    clearButton: "#clearButton",
    resultsList: "#resultsList"
  };
  return {
    getDOMStrings: function getDOMStrings() {
      return DOMStrings;
    },
    clearInput: function clearInput() {
      document.querySelector(DOMStrings.searchInput).value = "";
    },
    getInput: function getInput() {
      return document.querySelector(DOMStrings.searchInput).value;
    },
    setPlaceholder: function setPlaceholder(value) {
      document.querySelector(DOMStrings.searchInput).placeholder = value;
    },
    renderResults: function renderResults(results) {
      var resultsList = document.querySelector(DOMStrings.resultsList);
      resultsList.innerHTML = "";
      results.forEach(function (result) {
        var li = "<li class=\"result-card\"><h2 class=\"company-name\">".concat(result["Company Name"], "<a target=\"_blank\" href=\"https://google.com/search?q=").concat(result["Company Name"], "\"><i class=\"fab fa-google\"></i></a></h2><div>Date of Registration: <span class=\"bold\">").concat(result["Date of Registration"], "</span></div><div>ABN: <span class=\"bold\">").concat(result["ABN"], "</span></div></li>");
        resultsList.innerHTML += li;
      });
    }
  };
}(); // APP CONTROLLER


var controller = function (searchCtrl, UICtrl) {
  var DOM = UICtrl.getDOMStrings();

  var setupEventListeners = function setupEventListeners() {
    document.querySelector(DOM.searchForm).addEventListener("submit", async function (e) {
      e.preventDefault();
      var input = UICtrl.getInput();

      if (input) {
        var results = await searchCtrl.search(input);
        UICtrl.setPlaceholder(input);
        UICtrl.clearInput();
        var sortedResults = searchCtrl.sortResultsByDate(results, searchCtrl.stringToDate);
        UICtrl.renderResults(sortedResults);
      }
    });
    document.querySelector(DOM.clearButton).addEventListener("click", function () {
      UICtrl.clearInput();
    });
  };

  return {
    init: function init() {
      setupEventListeners();
    }
  };
}(searchController, UIController);

controller.init();