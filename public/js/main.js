// import View from './view.js';

// const container = document.getElementById('container');
// const view = new View(container);

// const button = document.getElementById('button');
// button.onclick = go;

// async function go() {

//     button.disabled = true;

//     const textarea = document.getElementById('domains');
//     const text = textarea.value;
//     const domains = text.split('\n');

//     console.log('Request for domains: ', domains);
//     let data = await request({ domains: domains });

//     console.log('Response: ', data);
//     data.forEach(item => {
//         view.addRow(item);
//     });

//     button.disabled = false;
// }

// async function request(data) {

//     let response = await fetch('/domain', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(data),
//     });

//     if (response.ok) {
//         let json = await response.json();
//         return json;
//     } else {
//         alert("Ошибка HTTP: " + response.status);
//     }

// }