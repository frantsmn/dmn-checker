module.exports = async function (browser, result) {

    async function grabInfo(page, container, result) {

        await page.addStyleTag({
            content: `
            .sparkline-container {
                overflow: visible !important;
                max-width: unset !important;
                width: max-content;
            }

            #donate_banner{
                display: none !important;
            }
            `
        })
            .then(() => {
                console.log(`>> Добавлены стили для контейнера [${result.data.domain}]`);
            })
            .catch(error => {
                const errorMessage = `ERROR >> Не удалось добавить стили для контейнера [${result.data.domain}]\n\n${error}\n\n`
                console.error(errorMessage);
                result.error.text += errorMessage;
                result.error.status = true;
            });

        await container.screenshot()
            .then(buffer => {
                result.data.img = buffer.toString('base64');
            })
            .catch(error => {
                const errorMessage = `ERROR >> Не удалось сделать скриншот\n\n${error}\n\n`
                console.error(errorMessage);
                result.error.text += errorMessage;
                result.error.status = true;
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
                console.log(`>> Найдены ссылки на страницы первого и последнего снимка сайта [${result.data.domain}]`);
                result.data.links = links;
            })
            .catch(error => {
                const errorMessage = `ERROR >> Не удалось найти ссылки на страницы первого и последнего снимка сайта [${result.data.domain}]\n\n${error}\n\n`
                console.error(errorMessage);
                result.error.text += errorMessage;
                result.error.status = true;
            });

    }

    let page;

    try {
        page = await browser.newPage();
    } catch (error) {
        const errorMessage = `ERROR >> Не удалось открыть вкладку для web.archive.org [${result.data.domain}]\n${error}\n\n`;
        console.error(errorMessage);
        result.error.text += errorMessage;
        result.error.status = true;
        return result;
    }

    await page.goto(`http://web.archive.org/web/*/${result.data.domain}`, { waitUntil: 'networkidle', networkIdleInflight: 0, networkIdleTimeout: '1000' })
        .then(() => {
            console.log(`>> Открыта страница [${result.data.domain}]`);
        })
        .catch(error => {
            const errorMessage = `ERROR >> Не удалось перейти на страницу web.archive.org [${result.data.domain}]\n${error}\n\n`;
            console.error(errorMessage);
            result.error.text += errorMessage;
            // result.error.status = true;
        });

    await page.waitForSelector('#wm-graph-anchor', { timeout: 4000 })
        .then(() => {
            console.log(`>> Найдено содержимое для скриншота [${result.data.domain}] на web.archive.org`);
        })
        .catch(error => {
            const errorMessage = `ERROR >> Не удалось найти содержимое для скриншота [${result.data.domain}] на web.archive.org\nCтраница с информацией о домене отсутствует, либо ресурс недоступен\n${error}\n\n`
            console.error(errorMessage);
            result.error.text += errorMessage;
            result.error.status = true;
        });

    await page.$('.sparkline-container')
        .then(async container => {
            if (container) {
                console.log(`>> Найден контейнер с информацией для скриншота [${result.data.domain}]`);

                await grabInfo(page, container, result)
                    .catch(error => {
                        const errorMessage = `ERROR >> Не удалось собрать информацию [${result.data.domain}]\n${error}\n\n`
                        console.error(errorMessage);
                        result.error.text += errorMessage;
                        result.error.status = true;
                    });
            }
        })
        .catch(error => {
            const errorMessage = `ERROR >> Не удалось найти контейнер с информацией для скриншота [${result.data.domain}]\n${error}\n\n`
            console.error(errorMessage);
            result.error.text += errorMessage;
            result.error.status = true;
        });

    await page.goto('about:blank');
    await page.close();
    
    console.log(`>> Вкладка закрыта [${result.data.domain}]\n\n`);

    return result;
}