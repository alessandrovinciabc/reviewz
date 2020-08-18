var dataController = (function () {
    //1. Store data in an array
    var entriesArr = [];

    var StudyEntry = function (desc) {
        this.desc = desc;
        this.date = new Date();
    };

    return {
        addItem: function (newItem) {
            entriesArr.push(new StudyEntry(newItem));
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
    };

    return {
        DOM: DOM,

        getForm: function () {
            var newItem;
            newItem = document.querySelector(DOM.addEntryText).value;

            return newItem;
        },

        clearForm: function () {
            document.querySelector(DOM.addEntryText).value = "";
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
    };

    var addItem = function () {
        var newEntry = ui.getForm();
        data.addItem(newEntry);
        ui.clearForm();

        console.log(data.getItems()); //debug
    };

    return {
        init: function () {
            setupEventListeners();
        },
    };
})(dataController, UIController);

controller.init();
