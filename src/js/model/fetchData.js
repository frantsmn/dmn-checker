export default async function fetchData(req, method) {
	try {
		const response = await fetch(`/api/${method}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(req),
		});

		if (response.ok) {
			return await response.json();
		} else {
			console.error(`ERROR >> Ошибка сервера! Код ${response.status}`);
			return undefined;
		}
	} catch (err) {
		console.error(`${err}\nСервер недоступен!\nНет интернет-соединения, либо закончилось бесплатное время пользования хостингом.`);
		return undefined;
	}
}