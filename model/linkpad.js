module.exports = async function (browser, result) {
    let page;

    try {
        page = await browser.newPage();
    } catch (error) {
        const errorMessage = `ERROR >> Не удалось открыть вкладку для linkpad.ru [${result.domain}]\n${error}\n\n`;
        console.error(errorMessage);
        result.donors = 'ошибка';
        result.errorText += errorMessage;
        return result;
    }

    await page.goto(`https://www.linkpad.ru/?search=${result.domain}`, { waitUntil: 'networkidle', networkIdleInflight: 0, networkIdleTimeout: '1000' })
        .then(() => {
            console.log(`>> Открыта страница linkpad.ru [${result.domain}]`);
        })
        .catch(error => {
            const errorMessage = `ERROR >> Не удалось перейти на страницу linkpad.ru [${result.domain}]\n${error}\n\n`;
            console.error(errorMessage);
            result.donors = 'ошибка';
            result.errorText += errorMessage;
        });

    await page.waitForSelector('#a4', { timeout: 3000 })
        .then(() => {
            console.log(`>> Найдены данные на linkpad.ru [${result.domain}]`);
        })
        .catch(error => {
            const errorMessage = `ERROR >> Не удалось найти данные на linkpad.ru [${result.domain}]\n${error}\n\n`
            console.error(errorMessage);
            result.donors = 'ошибка';
            result.errorText += errorMessage;
        });

    await page.evaluate(
        () => document.querySelector('#a4') ? document.querySelector('#a4').innerText : 'не найдено'
    )
        .then(donors => {
            console.log(`>> Данные с linkpad.ru прочитаны [${result.domain}]`);
            result.donors = donors;
        })
        .catch(error => {
            const errorMessage = `ERROR >> Не удалось прочесть данные со страницы linkpad.ru [${result.domain}]\n\n${error}\n\n`
            console.error(errorMessage);
            result.donors = 'ошибка';
            result.errorText += errorMessage;
        });

    await page.goto('about:blank');
    await page.close();
    console.log(`>> Вкладка закрыта [${result.domain}]\n\n`);

    return result;
}