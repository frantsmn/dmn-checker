import filterItems from "./utils/filterItems.js";
import sortItems from "./utils/sortItems.js";

import processDomains from "./model/processDomains.js";
import processQueryYandex from "./model/processQueryYandex.js";
import processTitles from "./model/processTitles.js";

Vue.component('card-component', {
    props: ['item'],
    template: '#card-component'
});

Vue.component('list-component', {
    props: ['list', 'filter', 'sort'],
    template: '#list-component',
    computed: {
        computedItems() {
            //Вычисления делать только для АКТИВНОГО списка
            if (!this.list.isActive)
                return this.list.items;

            let computedItems = [...this.list.items];
            computedItems = filterItems(computedItems, this.filter);
            sortItems(computedItems, this.sort);
            return computedItems;
        }
    }
});

Vue.component('list-pill-component', {
    props: ['list', 'lists'],
    template: '#list-pill-component',
    computed: {
        computedName() {
            return `Результаты`;
        }
    },
    methods: {
        deleteList(id) {
            const listIndex = this.lists.findIndex(list => list.id === id);
            this.lists.splice(listIndex, 1);
        }
    }
});

new Vue({
    el: '#app',
    data: {
        mode: 'search', //Режим работы [domain или search]

        textareaText: '', //Поле
        lists: [], //Сформированные списки результатов проверки

        sort: null, //Настройки сортировки (сохраняются в localstorage, используются компонентом list)
        filter: { //Настройки фильтра (сохраняются в localstorage, используются компонентом list)
            firstShot: false,
            firstShotDate: 0,
            lastShot: false,
            lastShotDate: 0,
            hideErrors: false
        },

        blockForm: false, //Необходимо для блокировки формы ввода
        progress: {
            value: 0,
            text: '',
            visible: false
        } //Отображает текущий прогресс в прогрессбаре формы
    },

    //Загрузка состояния из localStorage
    mounted() {
        if (localStorage.textareaText) {
            this.textareaText = localStorage.textareaText;
        }
        if (localStorage.sort) {
            this.sort = localStorage.sort;
        }
        if (localStorage.filter) {
            this.filter = JSON.parse(localStorage.filter);
        }
        if (localStorage.lists) {
            this.lists = JSON.parse(localStorage.lists);
        }
        this.checkMode();
    },

    //Сохранение состояния в localStorage
    watch: {
        textareaText(text) {
            localStorage.textareaText = text;
        },
        sort(sortType) {
            localStorage.sort = sortType;
        },
        filter: {
            handler: function (val, oldVal) {
                let filterState = JSON.stringify(val);
                localStorage.setItem('filter', filterState);
            },
            deep: true
        },
        lists: {
            handler: function (val, oldVal) {
                let lists = JSON.stringify(val);
                localStorage.setItem('lists', lists);
            },
            deep: true
        }
    },

    methods: {
        updateProgress(amount, ready) { this.progress.value = 100 / amount * ready; },
        switchTab(id) { this.lists.forEach(list => list.isActive = list.id === id ? true : false); },
        checkMode(e) {
            let matchList = /\r|\n/.test(this.textareaText);
            let matchDomain = /^(?!:\/\/)([a-zA-Z0-9-_]+\.)*[a-zA-Z0-9][a-zA-Z0-9-_]+\.[a-zA-Z]{2,11}?$/igm.test(this.textareaText);
            if (matchList || matchDomain) {
                this.mode = 'domain';
            } else {
                this.mode = 'search';
            }
        },

        async onSubmit() {
            this.blockForm = true;
            this.progress.visible = true;

            const list = {
                id: +new Date,
                name: 'Результаты',
                isBusy: true,
                isActive: true,
                domains: [],
                items: [],
            };
            //Добавить новую вкладку
            this.lists.unshift(list);
            //Сделать активной новую вкладку
            this.switchTab(list.id);

            switch (this.mode) {
                case 'domain':
                    await processDomains(list.items, this.textareaText, this.progress);
                    break;

                case 'search':
                    await processQueryYandex(list.items, this.textareaText, this.progress);
                    // await Promise.all([
                    //     () => processTitles(list.items, this.progress),
                    //     () => processDomains(list.items, undefined, this.progress)
                    // ].map(async func => await func()));
                    await processTitles(list.items, this.progress);
                    await processDomains(list.items, undefined, this.progress);
                    console.log('FINISH!');

                    break;
            }

            list.isBusy = false;
            this.progress.visible = false;
            this.blockForm = false;
        }
    }
});