var dataController = (function () {
    //1. Store data in an array
    var entriesArr = [];

    var StudyEntry = function (desc, id) {
        this.id = id;
        this.desc = desc;
        this.date = new Date();
        this.reviewsLeft = 9; //1h, 1d, 3d, 7d, 14d, 21d, 28d, 2m, 3m
    };

    StudyEntry.prototype.getDateString = function(){
        var day, month, year,
        months;

        months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        day = this.date.getDate();

        month = this.date.getMonth();
        month = months[month];

        year = this.date.getFullYear();

        return day + ' ' + month + ' ' + year;
    }

    return {
        addItem: function (newItem) {
            var newId, lastEntryId;

            if(entriesArr.length > 0){
                lastEntryId = entriesArr[entriesArr.length - 1].id;
                newId = lastEntryId + 1;
            } else {
                newId = 0;
            }
            entriesArr.push(new StudyEntry(newItem, newId));
        },

        getItems: function () {
            return entriesArr;
        },
    };
})();

var UIController = (function () {
    var DOM = {
        addEntryText: '#desc',
        addEntryBtn: '.entry-confirm',
        addEntryCancel: '.entry-cancel',
        entriesContainer: '.container-entries > .container-elements',
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

        displayEntry: function(entryToDisplay){
            var newEntryTemplate, newEntry, DOMentries;

            DOMentries =  document.querySelector(DOM.entriesContainer);

            newEntryTemplate = '<div class="entry-element entry-%entryId%"><div class="element-text"><span class="entry-info">Last Review: %date% - %reviews% more left<br></span>%desc%</div><div class="entry-buttons"><button class="info-btn"><i class="fas fa-info"></i></button><button class="delete-btn"><i class="fas fa-trash-alt"></i></button></div></div>';

            newEntry = newEntryTemplate.replace('%entryId%', entryToDisplay.id);
            newEntry = newEntry.replace('%desc%', entryToDisplay.desc);
            newEntry = newEntry.replace('%date%', entryToDisplay.getDateString());
            newEntry = newEntry.replace('%reviews%', entryToDisplay.reviewsLeft);

            DOMentries.insertAdjacentHTML('afterbegin', newEntry);
        },

        updateToday: function(){

        }
    };
})();

var controller = (function (data, ui) {
    var DOM = ui.DOM;

    var setupEventListeners = function () {
        document
            .querySelector(DOM.addEntryBtn)
            .addEventListener('click', function () {
                addItem();
            });

        document
            .querySelector(DOM.addEntryCancel)
            .addEventListener('click', function () {
                ui.clearForm();
            });

        document.addEventListener('keydown', function (event) {
            if (
                document.activeElement ===
                document.querySelector(DOM.addEntryText)
            ) {
                if (event.key === 'Enter') {
                    addItem();
                }
            }
        });
    };

    var addItem = function () {
        var newEntry = ui.getForm();

        if(newEntry !== ''){
            data.addItem(newEntry);
            ui.clearForm();
            ui.displayEntry(data.getItems()[data.getItems().length - 1]);
    
            console.log(data.getItems()); //debug
        }
    };

    return {
        init: function () {
            setupEventListeners();
        },
    };
})(dataController, UIController);

controller.init();
