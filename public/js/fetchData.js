export default async function fetchData(req, method) {
	try {

		const response = await fetch(`/${method}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(req),
		});

		if (response.ok) {
			return await response.json();
		} else {
			alert(`ERROR >> Сервер не передал данные! Код ${response.status}`);
			return undefined;
		}

	} catch (err) {

		console.error(err);
		alert(`Сервер недоступен!\n\nНет интернет-соединения, либо закончилось бесплатное время пользования хостингом.\n\nПроцесс проверки остановлен.`);
		return undefined;

	}
}