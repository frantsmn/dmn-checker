Vue.component('card-component', {
    props: ['item'],
    template: '#card-component',
});

new Vue({
    el: '#app',
    data: {
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
            this.isBusy = true;
            this.domains = this.textareaText
                .split('\n')
                .map((item, index) => ({ id: index, domain: item }));
            await processArray(this.domains, this.items, this.progress);

            setTimeout(() => {
                this.isBusy = false;
            }, 600);

            async function request(data) {
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

            async function processArray(array, items) {
                let groupedArray = [];
                let copiedArray = array.slice();

                while (copiedArray.length) {
                    groupedArray.push(copiedArray.splice(0, 3));
                }

                for (const item of groupedArray) {
                    console.log('Request for domains: ', item);
                    let response = await request({ domains: item });
                    console.log('response: ', response);
                    response.forEach(item => items.push(item));
                    console.log('\nitems: ', items);
                }
                console.log('Done for all domains!!!');
            }
        }
    }
});