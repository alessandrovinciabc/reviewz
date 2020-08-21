var dataController = (function () {
    var entriesArr = [];

    //1. Get data from local storage

    var StudyEntry = function (desc, id) {
        this.id = id;
        this.desc = desc;
        this.date = moment();
        this.reviewsLeft = 9; //1h, 1d, 3d, 7d, 14d, 21d, 28d, 2m, 3m
    };

    StudyEntry.prototype.getDateString = function () {
        return this.date.format("Do MMM YYYY");
    };

    StudyEntry.prototype.getDateNext = function () {
        this.date = moment();
        switch (this.reviewsLeft) {
            case 9:
                this.date.add(1, "h");
                break;
            case 8:
                this.date.add(1, "d");
                break;
            case 7:
                this.date.add(3, "d");
                break;
            case 6:
                this.date.add(7, "d");
                break;
            case 5:
                this.date.add(14, "d");
                break;
            case 4:
                this.date.add(21, "d");
                break;
            case 3:
                this.date.add(28, "d");
                break;
            case 2:
                this.date.add(2, "M");
                break;
            case 1:
                this.date.add(3, "M");
                break;
        }

        this.reviewsLeft--;
    };

    StudyEntry.prototype.formatReview = function () {
        switch (this.reviewsLeft) {
            case 9:
                return "+1h";
            case 8:
                return "+1d";
            case 7:
                return "+3d";
            case 6:
                return "+7d";
            case 5:
                return "+14d";
            case 4:
                return "+21d";
            case 3:
                return "+28d";
            case 2:
                return "+2m";
            case 1:
                return "+3m";
        }
    };

    return {
        addItem: function (newItem) {
            var newId, lastEntryId;

            if (entriesArr.length > 0) {
                lastEntryId = entriesArr[entriesArr.length - 1].id;
                newId = lastEntryId + 1;
            } else {
                newId = 0;
            }
            entriesArr.push(new StudyEntry(newItem, newId));

            //2. Save data to local storage too
        },

        getItems: function () {
            return entriesArr;
        },
    };
})();

var UIController = (function () {
    var DOM = {
        addEntryText: "#desc",
        addEntryBtn: ".entry-confirm",
        addEntryCancel: ".entry-cancel",
        entries: ".container-entries > .container-elements",
        today: ".container-today > .container-elements",
        tabToday: ".today-tab",
        tabEntries: ".entries-tab",
        todayContainer: ".container-today",
        entriesContainer: ".container-entries",
    };

    var Tab = function (tab, content) {
        this.tab = tab;
        this.content = content;
    };

    var tabs = [];

    tabs.push(
        new Tab(
            document.querySelector(DOM.tabToday),
            document.querySelector(DOM.todayContainer)
        )
    );
    tabs.push(
        new Tab(
            document.querySelector(DOM.tabEntries),
            document.querySelector(DOM.entriesContainer)
        )
    );

    return {
        DOM: DOM,

        tabs: tabs,

        getForm: function () {
            var newItem;
            newItem = document.querySelector(DOM.addEntryText).value;

            return newItem;
        },

        clearForm: function () {
            document.querySelector(DOM.addEntryText).value = "";
        },

        updateEntries: function (entries) {
            var newEntryTemplate, newEntry, DOMentries;

            DOMentries = document.querySelector(DOM.entries);

            DOMentries.innerHTML = "";

            newEntryTemplate =
                '<div class="entry-element entry-%entryId%"><div class="element-text"><span class="entry-info">Last Review: %date% - %reviews% more left - Next: %nextreview%<br></span>%desc%</div><div class="entry-buttons"><button class="delete-btn"><i class="fas fa-trash-alt"></i></button></div></div>';

            entries.forEach(function (current) {
                newEntry = newEntryTemplate;

                newEntry = newEntryTemplate.replace(
                    "%entryId%",
                    current.id
                );
                newEntry = newEntry.replace("%desc%", current.desc);
                newEntry = newEntry.replace(
                    "%date%",
                    current.getDateString()
                );
                newEntry = newEntry.replace(
                    "%reviews%",
                    current.reviewsLeft
                );
                newEntry = newEntry.replace(
                    "%nextreview%",
                    current.formatReview()
                );

                DOMentries.insertAdjacentHTML("afterbegin", newEntry);
            });
        },

        updateToday: function (entries) {
            var todaysDate, todayTemplate, newToday;
            todaysDate = moment();

            todayTemplate =
                '<div class="today-element today-%id%"><div class="element-text">%desc%</div><div class="next-review-text">%nextreview%</div><button class="today-confirm"><i class="far fa-check-circle"></i></button></div>';

            document.querySelector(DOM.today).innerHTML = "";

            entries.forEach(function (current) {
                newToday = todayTemplate;
                if (
                    current.date.isSame(todaysDate, "day") ||
                    current.date.isBefore(todaysDate, "day")
                ) {
                    newToday = todayTemplate.replace("%desc%", current.desc);
                    newToday = newToday.replace("%id%", current.id);
                    newToday = newToday.replace(
                        "%nextreview%",
                        current.formatReview()
                    );

                    document
                        .querySelector(DOM.today)
                        .insertAdjacentHTML("beforeend", newToday);
                }
            });
        },

        switchTab: function (tabs, selected) {
            tabs.forEach(function (current, index) {
                if (current === selected) {
                    current.tab.classList.add("selected-tab");

                    current.content.style.width = "100%";
                    current.content.style.display = "flex";
                } else {
                    current.tab.classList.remove("selected-tab");

                    current.content.style.width = "80%";
                    current.content.style.display = "none";
                }
            });
        },

        initTabs: function () {
            var mqPage = window.matchMedia("(max-width: 800px)");

            mqPage.addListener(function (e) {
                if (!e.matches) {
                    for (var i = 0; i < tabs.length; ++i) {
                        tabs[i].content.style.display = "flex";
                        tabs[i].content.style.width = "50%";
                        tabs[i].tab.classList.remove("selected-tab");
                    }

                    tabs[0].tab.classList.add("selected-tab");
                } else {
                    tabs[0].content.style.width = "100%";
                    for (var i = 1; i < tabs.length; ++i) {
                        tabs[i].content.style.display = "none";
                    }
                }
            });
        },
    };
})();

var controller = (function (data, ui) {
    var DOM = ui.DOM;

    var setupEventListeners = function () {
        document
            .querySelector(DOM.addEntryBtn)
            .addEventListener("click", function () {
                addItem();
            });

        document
            .querySelector(DOM.addEntryCancel)
            .addEventListener("click", function () {
                ui.clearForm();
            });

        document.addEventListener("keydown", function (event) {
            if (
                document.activeElement ===
                document.querySelector(DOM.addEntryText)
            ) {
                if (event.key === "Enter") {
                    addItem();
                }
            }
        });

        document
            .querySelector(DOM.today)
            .addEventListener("click", function (event) {
                var indexOfElement, clickedElement;

                if (
                    event.target.parentNode.classList.contains("today-confirm")
                ) {
                    indexOfElement = event.target.parentNode.parentNode.classList[1].replace(
                        "today-",
                        ""
                    );
                    indexOfElement = parseInt(indexOfElement);

                    clickedElement = data.getItems()[indexOfElement];

                    clickedElement.getDateNext();
                    ui.updateToday(data.getItems());
                    ui.updateEntries(data.getItems());

                    console.log(data.getItems()); //debug
                }
            });

        document
            .querySelector(DOM.tabToday)
            .addEventListener("click", function () {
                ui.switchTab(ui.tabs, ui.tabs[0]);
            });

        document
            .querySelector(DOM.tabEntries)
            .addEventListener("click", function () {
                ui.switchTab(ui.tabs, ui.tabs[1]);
            });
    };

    var addItem = function () {
        var newEntry = ui.getForm();

        if (newEntry !== "") {
            data.addItem(newEntry);
            ui.clearForm();

            ui.updateEntries(data.getItems());
            ui.updateToday(data.getItems());

            console.log(data.getItems()); //debug
        }
    };

    return {
        init: function () {
            setupEventListeners();
            ui.initTabs();
            ui.updateToday(data.getItems());
        },
    };
})(dataController, UIController);

controller.init();
