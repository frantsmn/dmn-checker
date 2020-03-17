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
            firstShotDate: 0,
            lastShot: false,
            lastShotDate: 0,
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

            let items = this.items;

            if (this.filter.hideErrors)
                items = this.items.filter(item => !item.isError);

            if (this.filter.firstShot && this.filter.firstShotDate)
                items = this.items.filter(item => {
                    if (item.links.length) {
                        return item.links[0].timestamp <= Date.parse(this.filter.firstShotDate)
                    } return true;
                });

            if (this.filter.lastShot && this.filter.lastShotDate)
                items = this.items.filter(item => {
                    if (item.links.length) {
                        return item.links[item.links.length - 1].timestamp >= Date.parse(this.filter.lastShotDate)
                    } return true;
                });

            return items
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
                    let obj = await response.json();
                    return obj;
                } else {
                    const obj = {
                        id: data.id,
                        domain: data.domain,
                        img: "",
                        links: [],
                        donors: "0",
                        isError: true,
                        errorText: "ERROR >> 503 - Ошибка сервера"
                    };
                    console.error(`\nОшибка HTTP: ${response.status}\n\nОтвет для ${data.domain}:\n`, obj, '\n\n');
                    return obj;
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