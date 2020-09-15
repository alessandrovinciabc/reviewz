let dataController = (function () {
    let entriesArr = [];

    class StudyEntry {
        constructor(desc, id) {
            this.id = id;
            this.desc = desc;
            this.date = moment();
            this.lastReview = moment();
            this.reviewsLeft = 9; //1h, 1d, 3d, 7d, 14d, 21d, 28d, 2m, 3m
        }

        getDateString() {
            return this.date.format('Do MMM YYYY');
        }

        getLastReview() {
            return this.lastReview.format('Do MMM YYYY');
        }

        getDateNext() {
            this.date = moment();
            this.lastReview = moment();
            switch (this.reviewsLeft) {
                case 9:
                    this.date.add(1, 'h');
                    break;
                case 8:
                    this.date.add(1, 'd');
                    break;
                case 7:
                    this.date.add(3, 'd');
                    break;
                case 6:
                    this.date.add(7, 'd');
                    break;
                case 5:
                    this.date.add(14, 'd');
                    break;
                case 4:
                    this.date.add(21, 'd');
                    break;
                case 3:
                    this.date.add(28, 'd');
                    break;
                case 2:
                    this.date.add(2, 'M');
                    break;
                case 1:
                    this.date.add(3, 'M');
                    break;
            }

            this.reviewsLeft--;
        }

        formatReview(offset) {
            if (!offset) {
                offset = 0;
            }
            switch (this.reviewsLeft + offset) {
                case 10:
                    return 'now';
                case 9:
                    return '1h';
                case 8:
                    return '1d';
                case 7:
                    return '3d';
                case 6:
                    return '7d';
                case 5:
                    return '14d';
                case 4:
                    return '21d';
                case 3:
                    return '28d';
                case 2:
                    return '2m';
                case 1:
                    return '3m';
                case 0:
                    return 'DONE!';
            }
        }
    }

    let convertElement = (el) => {
        let convertedElement;

        convertedElement = new StudyEntry();
        Object.assign(convertedElement, el);

        convertedElement.id = parseInt(convertedElement.id);

        convertedElement.date = moment(convertedElement.date);
        convertedElement.lastReview = moment(convertedElement.lastReview);
        convertedElement.reviewsLeft = parseInt(convertedElement.reviewsLeft);

        return convertedElement;
    };

    return {
        addItem: function (newItem) {
            let newId, lastEntryId;

            if (entriesArr.length > 0) {
                lastEntryId = entriesArr[entriesArr.length - 1].id;
                newId = lastEntryId + 1;
            } else {
                newId = 0;
            }
            entriesArr.push(new StudyEntry(newItem, newId));

            this.saveDB();
        },

        removeItem: function (id) {
            entriesArr.forEach((element, index) => {
                if (element.id === id) {
                    entriesArr.splice(index, 1);
                }
            });
            this.saveDB();
        },

        updateItem: function (id, newDesc, newNumReviews) {
            entriesArr.forEach((element) => {
                if (element.id === id) {
                    element.desc = newDesc;
                    element.reviewsLeft = newNumReviews;
                }
            });
        },

        getItems: function () {
            return entriesArr;
        },

        saveDB: function () {
            let convertedArr;

            convertedArr = JSON.stringify(entriesArr) || [];
            localStorage.setItem('db', convertedArr);
        },

        fetchDB: function () {
            let stringDB, reconverted, final;

            stringDB = localStorage.getItem('db');
            reconverted = JSON.parse(stringDB) || [];
            final = [];

            reconverted.forEach((el) => {
                let processed;
                processed = convertElement(el);

                final.push(processed);
            });

            entriesArr = final;
        },
    };
})();

let UIController = (() => {
    let DOM = {
        addEntryText: '#desc',
        addEntryBtn: '.entry-confirm',
        addEntryCancel: '.entry-cancel',
        entries: '.container-entries > .container-elements',
        today: '.container-today > .container-elements',
        tabToday: '.today-tab',
        tabEntries: '.entries-tab',
        todayContainer: '.container-today',
        entriesContainer: '.container-entries',
    };

    class Tab {
        constructor(tab, content) {
            this.tab = tab;
            this.content = content;
        }
    }

    let tabs = [];

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

    let changeTabsDisplay = function (dis, width, extraSteps) {
        if (arguments.length === 3) {
            for (let i = 0; i < tabs.length; ++i) {
                tabs[i].content.style.display = dis;
                tabs[i].content.style.width = width;
                extraSteps(i);
            }
        } else {
            for (let i = 0; i < tabs.length; ++i) {
                tabs[i].content.style.display = dis;
                tabs[i].content.style.width = width;
            }
        }
    };

    return {
        DOM: DOM,

        tabs: tabs,

        currentTab: 0,

        isUpdateRequired: true,

        getForm: function () {
            let newItem;
            newItem = document.querySelector(DOM.addEntryText).value;

            return newItem;
        },

        clearForm: function () {
            document.querySelector(DOM.addEntryText).value = '';
        },

        updateEntries: function (entries) {
            let newEntryTemplate, newEntry, DOMentries;

            DOMentries = document.querySelector(DOM.entries);

            DOMentries.innerHTML = '';

            newEntryTemplate =
                '<div class="entry-element entry-%entryId% entry"><div class="element-text"><span class="entry-info">Last Review: %date% - %reviews% more left - <span class="next-review">Next: %nextreview%</span><br></span><span><span class="item-desc">%desc%</span><span class="edit-form"><input class="edit-control edit-desc" type="text" autocomplete="off"><select class="edit-control edit-reviews"><option value="0">0</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option><option value="9">9</option><option value="10">10</option></select><button class="edit-confirm"><i class="far fa-check-circle"></i></button></span></span></div><div class="entry-buttons"><button class="edit-btn"><i class="fas fa-edit"></i></button><button class="delete-btn"><i class="fas fa-trash-alt"></i></button></div></div>';

            entries.forEach((current) => {
                newEntry = newEntryTemplate;

                newEntry = newEntryTemplate.replace('%entryId%', current.id);
                newEntry = newEntry.replace('%desc%', current.desc);
                newEntry = newEntry.replace('%date%', current.getLastReview());
                newEntry = newEntry.replace(
                    '%reviews%',
                    current.reviewsLeft + 1
                );

                if (current.reviewsLeft > -1) {
                    timeToReview = timeToReview = moment().to(current.date);
                } else {
                    timeToReview = 'COMPLETE!';
                }

                newEntry = newEntry.replace('%nextreview%', timeToReview);

                DOMentries.insertAdjacentHTML('afterbegin', newEntry);
            });
        },

        updateToday: function (entries) {
            let todaysDate, todayTemplate, newToday;
            todaysDate = moment();

            this.isUpdateRequired = true;

            todayTemplate =
                '<div class="today-element today-%id%"><div class="element-text">%desc%</div><div class="next-review-text">+%nextreview%</div><button class="today-confirm"><i class="far fa-check-circle"></i></button></div>';

            document.querySelector(DOM.today).innerHTML = '';

            entries.forEach((current) => {
                if (current.reviewsLeft > -1) {
                    newToday = todayTemplate;
                    if (current.date.isSameOrBefore(todaysDate, 'day')) {
                        newToday = todayTemplate.replace(
                            '%desc%',
                            current.desc
                        );
                        newToday = newToday.replace('%id%', current.id);
                        newToday = newToday.replace(
                            '%nextreview%',
                            current.formatReview()
                        );

                        document
                            .querySelector(DOM.today)
                            .insertAdjacentHTML('beforeend', newToday);
                    }
                }
            });
        },

        switchTab: function (tabs, selected) {
            tabs.forEach((current, index) => {
                if (current === selected) {
                    this.currentTab = index;
                    current.tab.classList.add('selected-tab');

                    current.content.style.width = '100%';
                    current.content.style.display = 'flex';
                } else {
                    current.tab.classList.remove('selected-tab');

                    current.content.style.width = '80%';
                    current.content.style.display = 'none';
                }
            });
        },

        initTabs: function () {
            let mqPage = window.matchMedia('(max-width: 800px)');

            mqPage.addEventListener('change', (e) => {
                if (!e.matches) {
                    changeTabsDisplay('flex', '50%', (index) => {
                        tabs[index].tab.classList.remove('selected-tab');
                    });
                    tabs[0].content.style.width = '40%';
                    tabs[1].content.style.width = '60%';
                } else {
                    changeTabsDisplay('none', '100%');
                }
                tabs[this.currentTab].content.style.display = 'flex';
                tabs[this.currentTab].tab.classList.add('selected-tab');
            });
        },
    };
})();

let controller = ((data, ui) => {
    let DOM = ui.DOM;

    let addItem = () => {
        let newEntry = ui.getForm();

        if (newEntry !== '') {
            data.addItem(newEntry);
            ui.clearForm();

            ui.updateEntries(data.getItems());
            ui.updateToday(data.getItems());
        }
    };

    let handleItemButtons = (event) => {
        let id;

        //To avoid errors related with random clicks on the page.
        try {
            let entryDiv, isInsideAnEntry, btnPressed, operationToPerform;

            let itemDesc,
                editForm,
                editDesc,
                editReviews,
                newDesc,
                newNumReviews;

            btnPressed = event.target.parentNode;

            //1.Check which button was pressed
            //2.Set attributes relative to the operation to perform
            if (btnPressed.classList.contains('delete-btn')) {
                entryDiv = event.target.parentNode.parentNode.parentNode;
                isInsideAnEntry = entryDiv.classList.contains('entry');
                operationToPerform = 'delete';
            } else if (btnPressed.classList.contains('edit-btn')) {
                entryDiv = event.target.parentNode.parentNode.parentNode;
                isInsideAnEntry = entryDiv.classList.contains('entry');
                operationToPerform = 'edit';
            } else if (btnPressed.classList.contains('edit-confirm')) {
                entryDiv =
                    event.target.parentNode.parentNode.parentNode.parentNode
                        .parentNode;
                isInsideAnEntry = entryDiv.classList.contains('entry');
                operationToPerform = 'confirm-edit';
            }

            //Check if the buttons were pressed inside an entry
            if (isInsideAnEntry) {
                id = entryDiv.classList[1].replace('entry-', '');
                id = parseInt(id);
                switch (operationToPerform) {
                    case 'delete': //Delete button was pressed
                        data.removeItem(id);

                        ui.updateToday(data.getItems());
                        ui.updateEntries(data.getItems());
                        break;
                    case 'edit': //Edit button was pressed
                        ui.isUpdateRequired = ui.isUpdateRequired
                            ? false
                            : true; //toggles edit form

                        [
                            itemDesc,
                            editForm,
                        ] = entryDiv.children[0].children[1].children;

                        [editDesc, editReviews] = editForm.children;

                        const itemToChange = data
                            .getItems()
                            .find((curr) => curr.id === id);
                        const currentNumOfReviews = itemToChange.reviewsLeft;

                        editForm.style.display = ui.isUpdateRequired
                            ? 'none'
                            : 'initial'; //Hide/show edit form

                        itemDesc.style.display = ui.isUpdateRequired
                            ? 'initial'
                            : 'none'; //Hide/show item description

                        editDesc.value = itemDesc.textContent;

                        editReviews.selectedIndex = currentNumOfReviews + 1;

                        break;
                    case 'confirm-edit': //Confirm edit button was pressed
                        [
                            newDesc,
                            newNumReviews,
                        ] = event.target.parentNode.parentNode.children;

                        [
                            itemDesc,
                            editForm,
                        ] = event.target.parentNode.parentNode.parentNode.children;

                        data.updateItem(
                            id,
                            newDesc.value,
                            parseInt(newNumReviews.value) - 1
                        );
                        itemDesc.style.display = 'initial';
                        editForm.style.display = 'none';

                        ui.updateToday(data.getItems());
                        ui.updateEntries(data.getItems());
                        break;
                }
            }
        } catch {}
    };

    let confirmReview = (event) => {
        let id, indexOfElement, clickedElement;

        if (event.target.parentNode.classList.contains('today-confirm')) {
            id = event.target.parentNode.parentNode.classList[1].replace(
                'today-',
                ''
            );
            id = parseInt(id);

            data.getItems().forEach((current, index) => {
                if (current.id === id) {
                    indexOfElement = index;
                }
            });

            clickedElement = data.getItems()[indexOfElement];
            clickedElement.getDateNext();

            data.saveDB();
            ui.updateToday(data.getItems());
            ui.updateEntries(data.getItems());
        }
    };

    let setupEventListeners = () => {
        document
            .querySelector(DOM.addEntryBtn)
            .addEventListener('click', addItem);

        document
            .querySelector(DOM.addEntryCancel)
            .addEventListener('click', ui.clearForm);

        document.addEventListener('keydown', (event) => {
            if (
                document.activeElement ===
                document.querySelector(DOM.addEntryText)
            ) {
                if (event.key === 'Enter') {
                    addItem();
                }
            }
        });

        document
            .querySelector(DOM.today)
            .addEventListener('click', confirmReview);

        document.querySelector(DOM.tabToday).addEventListener('click', () => {
            ui.switchTab(ui.tabs, ui.tabs[0]);
        });

        document.querySelector(DOM.tabEntries).addEventListener('click', () => {
            ui.switchTab(ui.tabs, ui.tabs[1]);
        });

        document
            .querySelector(DOM.entriesContainer)
            .addEventListener('click', handleItemButtons);
    };

    return {
        init: function () {
            data.fetchDB();
            setupEventListeners();
            ui.initTabs();
            ui.updateToday(data.getItems());
            ui.updateEntries(data.getItems());
            setInterval(() => {
                if (ui.isUpdateRequired) {
                    ui.updateEntries(data.getItems());
                    ui.updateToday(data.getItems());
                }
            }, 60000);
        },
    };
})(dataController, UIController);

controller.init();
