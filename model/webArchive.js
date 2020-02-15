module.exports = async function (browser, result) {

    async function grabInfo(page, container, result) {

        await page.addStyleTag({
            content: '.sparkline-container{overflow: visible !important; max-width: unset !important; width: max-content;}'
        })
            .then(() => {
                console.log(`>> Добавлены стили для контейнера [${result.domain}]`);
            })
            .catch(error => {
                const errorMessage = `ERROR >> Не удалось добавить стили для контейнера [${result.domain}]\n\n${error}\n\n`
                console.error(errorMessage);
                result.errorText += errorMessage;
                result.isError = true;
            });

        await container.screenshot()
            .then(buffer => {
                result.img = buffer.toString('base64');
            })
            .catch(error => {
                const errorMessage = `ERROR >> Не удалось сделать скриншот\n\n${error}\n\n`
                console.error(errorMessage);
                result.errorText += errorMessage;
                result.isError = true;
            });

        await page.evaluate(() => {
            let links = [];
            document.querySelectorAll('.captures-range-info a')
                .forEach(a => {
                    links.push({
                        href: a.href,
                        innerText: a.innerText,
                        timestamp: +new Date(a.innerText)
                    });
                });
            return links;
        })
            .then(links => {
                console.log(`>> Найдены ссылки на страницы первого и последнего снимка сайта [${result.domain}]`);
                result.links = links;
            })
            .catch(error => {
                const errorMessage = `ERROR >> Не удалось найти ссылки на страницы первого и последнего снимка сайта [${result.domain}]\n\n${error}\n\n`
                console.error(errorMessage);
                result.errorText += errorMessage;
            });

    }

    let page;

    try {
        page = await browser.newPage();
    } catch (error) {
        const errorMessage = `ERROR >> Не удалось открыть вкладку для web.archive.org [${result.domain}]\n${error}\n\n`;
        console.error(errorMessage);
        result.errorText += errorMessage;
        result.isError = true;
        return result;
    }

    await page.goto(`http://web.archive.org/web/*/${result.domain}`, { waitUntil: 'networkidle', networkIdleInflight: 0, networkIdleTimeout: '1000' })
        .then(() => {
            console.log(`>> Открыта страница [${result.domain}]`);
        })
        .catch(error => {
            const errorMessage = `ERROR >> Не удалось перейти на страницу web.archive.org [${result.domain}]\n${error}\n\n`;
            console.error(errorMessage);
            result.errorText += errorMessage;
            result.isError = true;
        });

    await page.waitForSelector('#wm-graph-anchor', { timeout: 5000 })
        .then(() => {
            console.log(`>> Найдено содержимое для скриншота [${result.domain}] на web.archive.org`);
        })
        .catch(error => {
            const errorMessage = `ERROR >> Не удалось найти содержимое для скриншота [${result.domain}] на web.archive.org\nВозможно страница с информацией о таком домене отсутствует, либо ресурс недоступен\n${error}\n\n`
            console.error(errorMessage);
            result.errorText += errorMessage;
            result.isError = true;
        });

    await page.$('.sparkline-container')
        .then(async container => {
            if (container) {
                console.log(`>> Найден контейнер с информацией для скриншота [${result.domain}]`);

                await grabInfo(page, container, result)
                    .catch(error => {
                        const errorMessage = `ERROR >> Не удалось собрать информацию [${result.domain}]\n${error}\n\n`
                        console.error(errorMessage);
                        result.errorText += errorMessage;
                        result.isError = true;
                    });
            }
        })
        .catch(error => {
            const errorMessage = `ERROR >> Не удалось найти контейнер с информацией для скриншота [${result.domain}]\n${error}\n\n`
            console.error(errorMessage);
            result.errorText += errorMessage;
            result.isError = true;
        });

    await page.goto('about:blank');
    await page.close();
    console.log(`>> Вкладка закрыта [${result.domain}]\n\n`);

    return result;
}