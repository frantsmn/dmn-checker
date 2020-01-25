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
        onSubmit: async function () {
            this.isBusy = true;
            this.domains = this.textareaText
                .split('\n')
                .map((item, index) => ({ id: index, domain: item }));
            // console.log('Request for domains: ', this.domains);
            this.items = await request({ domains: this.domains });
            this.isBusy = false;

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
        }
    }
});