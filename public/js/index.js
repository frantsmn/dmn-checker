import sortItems from "../js/sortItems.js";

Vue.component('card-component', {
    props: ['item'],
    template: '#card-component',
});

new Vue({
    el: '#app',
    data: {
        sort: null,
        filter: {
            firstShot: false,
            lastShot: false,
            hideErrors: false
        },
        isBusy: false,
        textareaText: '',
        domains: [],
        items: []
    },

    //Загрузка состояния инпутов сортировки и фильтров из localStorage
    mounted() {
        if (localStorage.sort) {
            this.sort = localStorage.sort;
        }
        if (localStorage.filter) {
            this.filter = JSON.parse(localStorage.filter);
        }
    },

    computed: {
        filteredItems() {
            sortItems(this.items, this.sort);

            if (this.filter.hideErrors)
                return this.items.filter(item => !item.isError);

            return this.items
        }
    },

    //Сохранение состояния инпутов сортировки и фильтров в localStorage
    watch: {
        sort(sortType) {
            localStorage.sort = sortType;
        },
        filter: {
            handler: function (val, oldVal) {
                let filterState = JSON.stringify(val);
                localStorage.setItem('filter', filterState);
            },
            deep: true
        }
    },

    methods: {
        onReset: function () {
            this.isBusy = false;
            this.textareaText = '';
            this.domains = [];
            this.items = [];
        },
        onSubmit: async function () {

            const request = async data => {
                let response = await fetch('/domain', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });

                if (response.ok) {
                    let json = await response.json();
                    return json;
                } else {
                    alert("Ошибка HTTP: " + response.status);
                }
            }

            const processArray = async (array, items) => {
                let groups = [];
                let copiedArray = array.slice();
                while (copiedArray.length) {
                    groups.push(copiedArray.splice(0, 3));
                }

                for (const group of groups) {
                    console.log('Request for domains group: ', group);
                    let response = await request({ domains: group });
                    console.log('Response: ', response);
                    response.forEach(item => items.push(item));
                }

                console.log('Done for all domains!!!');
            }

            this.isBusy = true;
            this.domains = this.textareaText
                .split('\n')
                .map((item, index) => ({ id: index, domain: item }));

            await processArray(this.domains, this.items, this.progress);

            setTimeout(() => {
                this.isBusy = false;
            }, 600);

        }
    }
});