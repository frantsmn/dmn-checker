export default class View {
    constructor(el) {
        this.container = el;
    }

    addRow(obj) {
        let div = document.createElement('div');
        div.setAttribute("class", "row");

        let linkTitle = document.createElement('a');
        linkTitle.setAttribute("href", `http://web.archive.org/web/*/${obj.domain}`);
        linkTitle.innerText = obj.domain;
        div.appendChild(linkTitle);

        
        if (obj.isError) {
            let errorMessage = document.createElement('code');
            errorMessage.innerText = obj.errorText;
            div.appendChild(errorMessage);

            this.container.appendChild(div);
            return
        }

        if (this.validateImg(obj)) {
            let img = document.createElement('img');
            img.setAttribute("src", `data:image/png;base64, ${obj.img}`);
            div.appendChild(img);
        }

        if (this.validateLinks(obj)) {
            let link1 = document.createElement('a');
            link1.setAttribute("href", obj.links[0].href);
            link1.innerText = obj.links[0] ? obj.links[0].innerText : "";
            div.appendChild(link1);

            let link2 = document.createElement('a');
            link2.setAttribute("href", obj.links[1].href);
            link2.innerText = obj.links[1].innerText;
            div.appendChild(link2);
        }

        this.container.appendChild(div);
    }

    validateImg = obj => obj.img && obj.img.length ? true : false;
    validateLinks = obj => obj.links.length === 2 ? true : false;
}