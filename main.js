var dataController = (function () {
    
})();

var UIController = (function () {

    var DOM = {
        addEntryText: "#desc",
        addEntryBtn: ".entry-confirm",
        addEntryCancel: ".entry-cancel",
    };

    return {
        DOM: DOM,

        getForm: function(){
            var newItem;
            newItem = document.querySelector(DOM.addEntryText).value;
            console.log(newItem);
        },

        clearForm: function(){
            document.querySelector(DOM.addEntryText).value = '';
        }
    } 
})();

var controller = (function (data, ui) {
    var DOM = ui.DOM;

    var setupEventListeners = function(){
        document.querySelector(DOM.addEntryBtn).addEventListener('click', function(){
            ui.getForm();
            ui.clearForm();
        });

        document.querySelector(DOM.addEntryCancel).addEventListener('click', function(){
            ui.clearForm();
        })

    }

    return{

        init: function(){
            setupEventListeners();
        },
    };

})(dataController, UIController);

controller.init();