const fetch = require('node-fetch');

module.exports = async function (url) {
	let title = '';

	try {
		const res = await fetch(url)
		const body = await res.text();
		title = body.split('<title>')[1].split('</title>')[0];
	}
	catch { title = '(ошибка)' }

	return title;
}