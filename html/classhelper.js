class ClassHelper extends HTMLElement {

    /** @type {URL} */
    apiURL = null;

    /** @type {string} */
    helpUrlPath = null;

    /** @type {string} */
    classHelperType = null;

    /** @type {{ index: string, size: string }} */
    page = { index: null, size: null }

    /** @type {{ name: string, property: string }} */
    form = { name: null, property: null };

    /** @type {string} */
    sort = null

    /** @type {{ width: string, height: string }} */
    popupSize = { width: null, height: null };

    /** @type {string[]} */
    fields = [];

    /** @type {Window} */
    popupRef = null;

    constructor() { super(); }

    /** 
     * from roundup docs rest api url - "{host}/{tracker}/rest/data/{class}"
     * we pass helpurl which is parsed from anchor tag and return a URL.
     * @param {string} path
     * @param {Object} [options]
     * @param {number} options.pageIndex
     * @param {number} options.pageSize
     * @param {string[] | string} options.fields
     * @param {string} [options.sort]
     * @returns {URL} */
    getRestURL(path, options) {
        const restDataPath = "rest/data";
        const origin = window.location.origin;
        const tracker = window.location.pathname.split('/')[1];
        if (!tracker || tracker < 1) {
            throw new Error("error parsing tracker name from window url");
        }

        let base = origin + "/" + tracker + "/" + restDataPath + "/" + path;
        let url = new URL(base);

        url.searchParams.append("@page_index", options.pageIndex);
        url.searchParams.append("@page_size", options.pageSize);
        let fields = Array.isArray(options.fields) ? options.fields.join(',') : options.fields;
        url.searchParams.append("@fields", fields);

        if (options.sort) {
            url.searchParams.append("@sort", options.sort);
        }

        return url;
    }

    getSearchFragment() {
        const fragment = document.createDocumentFragment();
        const form = document.createElement("form");
        form.setAttribute("id", "popup-search");

        const params = this.getAttribute("searchWith").split(',');
        // for (var param of params) {
        //     const prop = document.createElement("div");
        //     // prop.style.marginRight = "20px";
        //     const input = document.createElement("input");
        //     input.setAttribute("name", param);
        //     const label = document.createElement("label");
        //     label.textContent = param;
        //     label.setAttribute("for", param);

        //     prop.appendChild(label);
        //     prop.appendChild(input);
        //     form.appendChild(prop);
        // }

    //     for (var param of params) {
    //         const row = document.createElement("tr");
    
    //         const th = document.createElement("th");
    //         const label = document.createElement("label");
    //         label.textContent = param + ":";
    //         label.setAttribute("for", param);
    //         th.appendChild(label);
    //         row.appendChild(th);
    
    //         const td = document.createElement("td");
    //         const input = document.createElement("input");
    //         input.setAttribute("name", param);
    //         input.setAttribute("id", param);
    //         td.appendChild(input);
    //         row.appendChild(td);
    
    //         form.appendChild(row);
    //     }

    //     const searchRow = document.createElement("tr");
    // const searchCell = document.createElement("td");
    // const searchButton = document.createElement("button");
    // searchButton.textContent = "Search";
    // searchButton.addEventListener("click", (e) => {
    //     e.preventDefault();
    //     let fd = new FormData(form);
    //     this.dispatchEvent(new CustomEvent("search", {
    //         detail: {
    //             data: fd
    //         }
    //     }));
    // });
    // searchCell.appendChild(searchButton);
    // searchRow.appendChild(searchCell);
    // form.appendChild(searchRow);

    // const resetRow = document.createElement("tr");
    // const resetCell = document.createElement("td");
    // const resetButton = document.createElement("button");
    // resetButton.textContent = "Reset";
    // resetButton.addEventListener("click", (e) => {
    //     e.preventDefault();
    //     form.reset();
    // });
    // resetCell.appendChild(resetButton);
    // resetRow.appendChild(resetCell);
    // form.appendChild(resetRow);

    // fragment.appendChild(form);

    // return fragment;



    const table = document.createElement("table");

    for (var param of params) {
        const row = document.createElement("tr");
        const labelCell = document.createElement("td");
        const inputCell = document.createElement("td");

        const label = document.createElement("label");
        label.textContent = param + ":";
        label.setAttribute("for", param);

        if (param === "username" || param === "phone" || param === "roles") {
            label.style.fontWeight = "bold";
        }

        const input = document.createElement("input");
        input.setAttribute("name", param);
        input.setAttribute("id", param);

        labelCell.appendChild(label);
        row.appendChild(labelCell);

        inputCell.appendChild(input);
        row.appendChild(inputCell);

        table.appendChild(row);
    }

    // Add an empty row
    const emptyRow = document.createElement("tr");
    const emptyCell = document.createElement("td");
    emptyRow.appendChild(emptyCell);
    table.appendChild(emptyRow);

    // Add search and reset buttons
    const buttonRow = document.createElement("tr");
    const buttonCell = document.createElement("td");
    buttonCell.colSpan = 2;

    const search = document.createElement("button");
    search.textContent = "Search";
    search.addEventListener("click", (e) => {
        e.preventDefault();
        let fd = new FormData(form);
        this.dispatchEvent(new CustomEvent("search", {
            detail: {
                data: fd
            }
        }));
    });

    const reset = document.createElement("button");
    reset.textContent = "Reset";
    reset.addEventListener("click", (e) => {
        e.preventDefault();
        form.reset();
    });

    buttonCell.appendChild(search);
    buttonCell.appendChild(reset);
    buttonRow.appendChild(buttonCell);
    table.appendChild(buttonRow);

    form.appendChild(table);
    fragment.appendChild(form);

    return fragment;

        // const search = document.createElement("button");
        // search.textContent = "Search";
        
        // const reset = document.createElement("button");
        // reset.textContent = "Reset";

        // search.addEventListener("click", (e) => {
        //     e.preventDefault()
        //     let fd = new FormData(form);
        //     this.dispatchEvent(new CustomEvent("search", {
        //         detail: {
        //             data: fd
        //         }
        //     }));
        // });

        // reset.addEventListener("click", (e) => {
        //     e.preventDefault();
        //     form.reset();
        // })

        // form.appendChild(search);
        // form.appendChild(reset);

        // fragment.appendChild(form);

        // return fragment;
    }

    getPaginationFragment(prevUrl, nextUrl) {
        const fragment = document.createDocumentFragment();
        const table = document.createElement('table');
        table.setAttribute("id", "popup-pagination");
        const tr = document.createElement('tr');
        const prev = document.createElement('td');
        if (prevUrl) {
            const a = document.createElement('button');
            a.addEventListener("click", () => {
                this.dispatchEvent(new CustomEvent("prevPage", {
                    detail: {
                        url: prevUrl
                    }
                }));
            });
            a.textContent = `<<previous`;
            prev.appendChild(a);
        }
        const info = document.createElement('td');
        info.textContent = `${this.page.index}..${parseInt(this.page.index) * parseInt(this.page.size)}`;
        const next = document.createElement('td');
        if (nextUrl) {
            const a = document.createElement('button');
            a.addEventListener("click", () => {
                this.dispatchEvent(new CustomEvent("nextPage", {
                    detail: {
                        url: nextUrl
                    }
                }));
            });
            a.textContent = `next>>`;
            next.appendChild(a);
        }

        tr.append(prev, info, next);
        table.appendChild(tr);
        fragment.appendChild(table);
        return fragment;
    }

    getAccumulatorFragment() {
        const fragment = document.createDocumentFragment();
        const div = document.createElement("div");
        div.setAttribute("id", "popup-control");

        const preview = document.createElement("input");
        preview.setAttribute("id", "popup-preview");
        preview.type = "text";
        preview.name = "preview";

        const cancel = document.createElement("button");
        cancel.textContent = "Cancel";
        cancel.addEventListener("click", () => {
            preview.value = "";
        })

        const apply = document.createElement("button");
        apply.textContent = "Apply";
        apply.style.fontWeight = "bold";
        apply.addEventListener("click", () => {
            this.dispatchEvent(new CustomEvent("valueSelected", {
                detail: {
                    value: preview.value
                }
            }))
        })

        div.innerHTML = `<style>
        #popup-control {
            position: fixed;
            display: block;
            top: auto;
            right: 0;
            bottom: 0;
            left: 0;
            padding: .5em;
            border-top: 2px solid #444;
            background-color: #eee;
          }
          
          #popup-preview {
            margin-right: 3em;
            margin-left: 1em;
          }
          
          #popup-control button {
            margin-right: 2em;
            margin-left: 2em;
            width: 7em;
          }
          </style>
          `;
        div.append(preview, cancel, apply);
                        
        fragment.appendChild(div);

        return fragment;
    }

    /**
     * 
     * @param {string[]} headers 
     * @param {Object.<string, any>[]} data 
     * @returns 
     */
    getTableFragment(headers, data) {
        const fragment = document.createDocumentFragment();
        const table = document.createElement('table');
        table.setAttribute("id", "popup-table");
        const thead = document.createElement('thead');
        const tbody = document.createElement('tbody');
        const tfoot = document.createElement('tfoot'); // Create table footer
    
        // Create table headers
        const headerRow = document.createElement('tr');
        let thx = document.createElement("th");
        thx.textContent = "X";
        headerRow.appendChild(thx);
    
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
    
        // Create table body with data
        data.forEach(entry => {
            const row = document.createElement('tr');
    
            const checkbox = document.createElement("input");
            checkbox.setAttribute("type", "checkbox");
            row.appendChild(checkbox);
            row.style.cursor = "pointer";
    
            headers.forEach(header => {
                const td = document.createElement('td');
                td.textContent = entry[header];
                row.appendChild(td);
            });
    
            row.addEventListener("click", () => {
                checkbox.checked = !checkbox.checked;
                this.dispatchEvent(new CustomEvent("selection", {
                    detail: {
                        value: entry[headers[0]]
                    }
                }))
            });
    
            tbody.appendChild(row);
        });
    
        // Create table footer with the same column values as headers
        const footerRow = document.createElement('tr');
        let footThx = document.createElement("th");
        footThx.textContent = "X";
        footerRow.appendChild(footThx);
    
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            footerRow.appendChild(th);
        });
        tfoot.appendChild(footerRow);
    
        table.innerHTML = `
            <style>
                #popup-table {
                    table-layout: fixed;
                    overflow: hidden;
                    font-size: .9em;
                    padding-bottom: 3em;
                }
                
                table th {
                    font-weight: normal;
                    text-align: left;
                    color: #444;
                    background-color: #efefef;
                    border-bottom: 1px solid #afafaf;
                    border-top: 1px solid #afafaf;
                    text-transform: uppercase;
                    vertical-align: middle;
                    line-height:1.5em;
                }
                
                table td {
                    vertical-align: middle;
                    padding-right: .2em;
                    border-bottom: 1px solid #efefef;
                    text-align: left;
                    empty-cells: show;
                    white-space: nowrap;
                    vertical-align: middle;
                }
                
                table tr:hover {
                    background-color: #eee;
                }
            </style>
        `;
    
        // Assemble the table
        table.appendChild(thead);
        table.appendChild(tbody);
        table.appendChild(tfoot); // Append the footer
        
        fragment.appendChild(table);
    
        return fragment;
    }
    
    


    connectedCallback() {
        /** @type {HTMLElement | null} */
        const slottedURL = this.firstElementChild;
        if (slottedURL == null || slottedURL.tagName.toLocaleLowerCase() != 'a') {
            throw new Error("roundup-classhelper must wrap a classhelp link");
        }

        // replace the anchor element with span to handle 
        const span = document.createElement("span");
        span.textContent = slottedURL.textContent;
        // make changes for style in templates
        span.style.display = "inline";
        span.style.cursor = "pointer";
        span.style.color = "blue";

        this.replaceChild(span, slottedURL);

        this.popupSize.width = slottedURL.dataset.width;
        this.popupSize.height = slottedURL.dataset.height;

        // parse the URL
        const splitted = slottedURL.dataset.helpurl.split('?');
        this.helpUrlPath = splitted[0];
        const searchParams = new URLSearchParams(splitted[1]);

        this.classHelperType = searchParams.get("type");
        this.form.name = searchParams.get("form");
        this.form.property = searchParams.get("property");
        this.page.index = (parseInt(searchParams.get("@startwith")) + 1).toString();
        this.page.size = searchParams.get("@pagesize");
        this.sort = searchParams.get("@sort");
        this.fields = searchParams.get("properties").split(',');

        /**
         * @todo Ask about the columns being username, realname, phone, organisation, roles
         * but the properties in classhelp is username, realname, address (fix template? 
         * harcode new values?)
         */
        if (this.helpUrlPath == "user") {
            this.fields = ['username', 'realname', 'phone', 'organisation', 'roles'];
        }

        this.apiURL = this.getRestURL(this.helpUrlPath, {
            pageIndex: this.page.index,
            pageSize: this.page.size,
            fields: this.fields,
            sort: this.sort
        });

        // Listners
        span.addEventListener("click", this.openPopUp.bind(this));
        this.addEventListener("nextPage", this.nextPage.bind(this));
        this.addEventListener("prevPage", this.prevPage.bind(this));
        this.addEventListener("valueSelected", this.valueSelected.bind(this));
        this.addEventListener("search", this.searchEvent.bind(this));
        this.addEventListener("selection", this.selectionEvent.bind(this));
    }

    /** @param {MouseEvent} _event */
    openPopUp(_event) {
        let popupFeatures = "popup=yes";
        popupFeatures += ",width=" + this.popupSize.width;
        popupFeatures += ",height=" + this.popupSize.height;
        this.popupRef = window.open("about:blank", "_blank", popupFeatures);
        fetch(this.apiURL).then(resp => resp.json()).then(({ data }) => {
            const b = this.popupRef.document.body;
            let prevURL = data["@links"].prev ?? null;
            if (prevURL) {
                prevURL = prevURL[0].uri;
            }
            let nextURL = data["@links"].next ?? null;
            if (nextURL) {
                nextURL = nextURL[0].uri;
            }

            if (this.getAttribute("searchWith")) {
                b.appendChild(this.getSearchFragment());
            }

            b.appendChild(this.getPaginationFragment(prevURL, nextURL));
            b.appendChild(this.getTableFragment(this.fields, data.collection));
            b.appendChild(this.getAccumulatorFragment());
        });
    }

    /** @param {MouseEvent} event */
    nextPage(event) {
        this.page.index = (parseInt(this.page.index) + 1).toString();
        fetch(event.detail.url).then(resp => resp.json()).then(({ data }) => {
            const b = this.popupRef.document.body;
            let prevURL = data["@links"].prev ?? null;
            if (prevURL) {
                prevURL = prevURL[0].uri;
            }
            let nextURL = data["@links"].next ?? null;
            if (nextURL) {
                nextURL = nextURL[0].uri;
            }

            let oldPagination = this.popupRef.document.getElementById("popup-pagination");
            b.replaceChild(this.getPaginationFragment(prevURL, nextURL), oldPagination);
            let oldTable = this.popupRef.document.getElementById("popup-table");
            b.replaceChild(this.getTableFragment(this.fields, data.collection), oldTable);
        });
    }

    /** @param {MouseEvent} event */
    prevPage(event) {
        this.page.index = (parseInt(this.page.index) - 1).toString();
        fetch(event.detail.url).then(resp => resp.json()).then(({ data }) => {
            const b = this.popupRef.document.body;
            let prevURL = data["@links"].prev ?? null;
            if (prevURL) {
                prevURL = prevURL[0].uri;
            }
            let nextURL = data["@links"].next ?? null;
            if (nextURL) {
                nextURL = nextURL[0].uri;
            }

            let oldPagination = this.popupRef.document.getElementById("popup-pagination");
            b.replaceChild(this.getPaginationFragment(prevURL, nextURL), oldPagination);
            let oldTable = this.popupRef.document.getElementById("popup-table");
            b.replaceChild(this.getTableFragment(this.fields, data.collection), oldTable);
        });
    }

    /** @param {MouseEvent} event */
    valueSelected(event) {
        const input = window.document.querySelector(`form[name="${this.form.name}"] input[name="${this.form.property}"]`);
        input.value = event.detail.value;
    }

    searchEvent(event) {
        const apiWithSearchURL = new URL(this.apiURL.toString());

        for (let entry of event.detail.data.entries()) {
            if (entry[1] != null && entry[1] != "") {
                apiWithSearchURL.searchParams.append(entry[0], entry[1]);
            }
        }

        fetch(apiWithSearchURL).then(resp => resp.json()).then(({data}) => {
            const b = this.popupRef.document.body;

            let oldTable = this.popupRef.document.getElementById("popup-table");
            b.replaceChild(this.getTableFragment(this.fields, data.collection), oldTable);
        });
    }

    selectionEvent(event) {
        const preview = this.popupRef.document.getElementById("popup-preview");
        if (preview.value == "" || preview.value == null) {
            preview.value = event.detail.value
        } else {
            const values = preview.value.split(',');
            const exists = values.findIndex(v => v == event.detail.value.toString());

            if (exists > -1) {
                values.splice(exists, 1);
                preview.value = values.join(',');
            } else {
                preview.value += ',' + event.detail.value;
            }
        }
    }
}

customElements.define("roundup-classhelper", ClassHelper);