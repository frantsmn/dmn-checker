import filterItems from "./filterItems.js";
import sortItems from "../js/sortItems.js";

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
        textareaText: '', //Поле с доменами на проверку
        lists: [], //Сформированные списки результатов проверки

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

        async onSubmit() {
            const request = async data => {
                try {

                    let response = await fetch('/domain', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data),
                    });

                    if (response.ok) {
                        let obj = await response.json();
                        return obj;
                    } else {
                        let errorResponse = data.map(item => {
                            return {
                                id: item.id,
                                domain: item.domain,
                                isError: true,
                                errorText: "ERROR >> 503 - ошибка сервера!"
                            };
                        });
                        return errorResponse;
                    }

                } catch (err) {
                    console.error(err);
                    alert(`Сервер недоступен!\n\nНет интернет-соединения, либо закончилось бесплатное время пользования хостингом.\n\nПроцесс проверки остановлен.`);
                    let errorResponse = data.map(item => {
                        return {
                            id: item.id,
                            domain: item.domain,
                            isError: true,
                            errorText: "ERROR >> Сервер недоступен!"
                        };
                    });
                    this.stopProcessAray = true;
                    return errorResponse;
                }
            }
            const processArray = async (array, items) => {
                let groups = [];
                let copiedArray = array.slice();
                while (copiedArray.length) {
                    groups.push(copiedArray.splice(0, 3));
                }

                for (const group of groups) {

                    console.log('<< Request: ', group);
                    let response = await request(group);
                    console.log('>> Response: ', response);

                    response.forEach(item => items.push(item));
                    this.updateProgress(array.length, items.length);

                    if (this.stopProcessAray) {
                        break;
                    };
                }

                console.log('Done for all domains!!!');
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

            this.lists.unshift(list);

            //Сделать активной новую вкладку
            this.switchTab(list.id);

            list.domains = this.textareaText
                .split('\n')
                .map((item, index) => ({ id: index, domain: item }));

            await processArray(list.domains, list.items, this.progress);

            list.isBusy = false;
            setTimeout(() => {
                this.isBusy = false;
                this.updateProgress(0, 0);
            }, 600);

        }
    }
});