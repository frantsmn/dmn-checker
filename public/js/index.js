Vue.component('card-component', {
    props: ['item'],
    template: '#card-component',
});

new Vue({
    el: '#app',
    data: {
        sort: '',
        isBusy: false,
        textareaText: '',
        domains: [],
        items: []
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
                    this.sortItems(items);
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

        },

        sortItems: function (items) {
            items = items.length ? items : this.items;
            switch (this.sort) {
                case 'alphabet':
                    this.sortByAlphabet(items);
                    break;

                case 'age':
                    this.sortByAge(items);
                    break;

                case 'donors':
                    this.sortByDonors(items);
                    break;

                default:
                    this.sortById(items);
                    break;
            }
        },
        sortByAlphabet: function (items) {
            items.sort((a, b) => {
                if (a.domain > b.domain) {
                    return 1;
                }
                if (a.domain < b.domain) {
                    return -1;
                }
                return 0;
            });
            console.log('Sorted by alpabet');
        },
        sortByAge: function (items) {
            items.sort((a, b) => {
                if (a.links.length && b.links.length) {
                    let _a = parseInt(a.links[0].timestamp);
                    let _b = parseInt(b.links[0].timestamp);
                    return _a - _b;
                } else {
                    return -1;
                }
            });
            console.log('Sorted by age');
        },
        sortByDonors: function (items) {
            items.sort((a, b) => {
                let _a = parseInt(a.donors.replace(/\s/g, ""));
                let _b = parseInt(b.donors.replace(/\s/g, ""));
                return _b - _a;
            });
            console.log('Sorted by donors');
        },
        sortById: function (items) {
            items.sort((a, b) => a.id - b.id);
            console.log('Sorted by id');
        }

    }
});