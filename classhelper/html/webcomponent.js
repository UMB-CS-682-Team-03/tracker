class ClassHelper extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
        <style>
            :host {
            display: block;
            padding: 1em;
            border: 1px solid #000;
            background-color: #f4f4f4;
            }
        </style>
    `;
        let a = this.querySelector('a');
        let helpurl = a.dataset.helpurl;
        let [hostName, searchString] = helpurl.split('?', 2);
        let searchParams = new URLSearchParams(searchString);

        this.addEventListener('click', () => {
            this.openPopup(searchParams);
        });
    }

    openPopup(params) {
        let doc = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
        </head>
        <body>
            <h1>HELO</h1>    
        </body>
        </html>
        `;

        let dataUrl = URL.createObjectURL(new Blob([doc], { type: "text/html" }));

        let popup = window.open(dataUrl, '_blank', 'popup=yes,width=600,height=600');
        // window.open(URL.createObjectURL(new Blob(["<h1>Hello</h1>"], { type: "text/html" })), '_blank', 'popup=yes,width=600,height=600');

        popup.onload = () => {
            popup.document.title = "Class Helper";
            // popup.document
            // popup.document.body.innerHTML = `<h1>HELP ME HOPE THIS WORKS</h1>`;
        }
    }
}

customElements.define('roundup-classhelper', ClassHelper);