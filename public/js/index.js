import filterItems from "./filterItems.js";
import sortItems from "./sortItems.js";
import fetchData from "./fetchData.js";

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
            if (!this.list.isActive) return this.list.items;

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
            let computedName = `Результаты (${this.list.items.length || 0} из ${this.list.domains.length || '??'})`;
            if (!computedName) return 'Результаты';
            return computedName;
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
        textareaText: '', //Поле
        lists: [], //Сформированные списки результатов проверки

        mode: 'domain', //domain or search

        sort: null, //Настройки сортировки (сохраняются в localstorage, используются компонентом list)
        filter: { //Настройки фильтра (сохраняются в localstorage, используются компонентом list)
            firstShot: false,
            firstShotDate: 0,
            lastShot: false,
            lastShotDate: 0,
            hideErrors: false
        },

        isBusy: false, //Необходимо для блокировки формы ввода
        progress: 0, //Отображает текущий прогресс в прогрессбаре формы
        stopProcessAray: false, //Принудительная остановка процесса (потеря связи с сервером)
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
        updateProgress(amount, ready) { this.progress = 100 / amount * ready; },

        switchTab(id) { this.lists.forEach(list => list.isActive = list.id === id ? true : false); },

        onReset() { this.textareaText = ''; },

        onTextareaInput(e) {
            let matchList = /\r|\n/.test(this.textareaText);
            let matchDomain = /^(?!:\/\/)([a-zA-Z0-9-_]+\.)*[a-zA-Z0-9][a-zA-Z0-9-_]+\.[a-zA-Z]{2,11}?$/igm.test(this.textareaText);
            if (matchList || matchDomain) {
                this.mode = 'domain';
            } else {
                this.mode = 'search';
            }
        },

        async onSubmit() {
            const processDomains = async (domains, items) => {
                let groups = [];
                let copiedArray = domains.slice();
                while (copiedArray.length) {
                    groups.push(copiedArray.splice(0, 3));
                }

                for (const group of groups) {

                    console.log('<< Request: ', group);
                    let response = await fetchData(group, 'domain');
                    console.log('>> Response: ', response);

                    if (!response) {
                        console.log('Breaked!!! :(');
                        break;
                    } else {
                        response.forEach(item => items.push(item));
                        this.updateProgress(domains.length, items.length);
                    }
                }

                console.log('Done!!! :)');
            }

            const processQuery = async (query, items) => {
                this.updateProgress(2, 1);
                let response = await fetchData({ query }, 'search');
                response.forEach(item => items.push(item));
                this.updateProgress(2, 2);
                this.stopProcessAray = true;
            }

            this.isBusy = true;
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
                    list.domains = this.textareaText
                        .split('\n')
                        .map((item, index) => ({ id: index, domain: item }));
                    await processDomains(list.domains, list.items);
                    break;

                case 'search':
                    await processQuery(this.textareaText, list.items);
                    break;
            }

            this.stopProcessAray = true;
            list.isBusy = false;
            setTimeout(() => {
                this.isBusy = false;
                this.updateProgress(0, 0);
            }, 600);

        }
    }
});