class ClassHelper extends HTMLElement {
    /** @type {Window} */
    popupRef = null;
    static translations = null;

    connectedCallback() {
        let links = this.querySelectorAll("a");
        if (links.length != 1) {
            throw new Error("roundup-classhelper must wrap a single classhelp link");
        }
        let link = links.item(0);
        link.onclick = null;

        const linkProp = ClassHelper.parseLink(link);
        const apiURL = ClassHelper.getRestURL(linkProp);

        ClassHelper.fetchTranslations();

        // Listeners
        link.addEventListener("click", (event) => {
            event.preventDefault();
            this.openPopUp(apiURL, linkProp);
        });
        this.addEventListener("nextPage", (event) => {
            this.pageChange(event.detail.value, linkProp);
        });
        this.addEventListener("prevPage", (event) => {
            this.pageChange(event.detail.value, linkProp);
        });
        this.addEventListener("valueSelected", (event) => {
            this.valueSelected(linkProp, event.detail.value);
        });
        this.addEventListener("search", (event) => {
            const searchURL = ClassHelper.getSearchURL(linkProp, event.detail.value);
            this.searchEvent(searchURL, linkProp);
        });
        this.addEventListener("selection", (event) => {
            this.selectionEvent(event.detail.value);
        });
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "searchWith") {
            if (oldValue === null) {
                return;
            }
            let oldForm = this.popupRef.document.getElementById("popup-search");
            let newForm = this.getSearchFragment();
            this.popupRef.document.body.replaceChild(newForm, oldForm);
        }
    }

    static async fetchTranslations() {
        if (ClassHelper.translations != null) {
            return;
        }

        let translations = {
            "Apply": "",
            "Cancel": "",
            "Next": "",
            "Prev": "",
            "Search": "",
            "Reset": "",
            "Out": ""
        };

        let tracker = window.location.pathname.split('/')[1];
        let url = new URL(window.location.origin + "/" + tracker);
        url.searchParams.append("@template", "json");
        url.searchParams.append("properties", Object.keys(translations).join(','));

        let resp = await fetch(url);
        if (!resp.ok) {
            throw new Error("error fetching translations from roundup rest api");
        }
        ClassHelper.translations = await resp.json();
    }

    /**
     * @param {HTMLAnchorElement} link
     */
    static parseLink(link) {

        if (!link.dataset.helpurl) {
            throw new Error("roundup-classhelper link must have a data-helpurl attribute");
        }

        if (!link.dataset.width) {
            throw new Error("roundup-classhelper link must have a data-width attribute");
        }

        if (!link.dataset.height) {
            throw new Error("roundup-classhelper link must have a data-height attribute");
        }

        const width = link.dataset.width;
        const height = link.dataset.height;

        const splitResult = link.dataset.helpurl.split('?');

        if (splitResult.length != 2) {
            throw new Error("invalid helpurl from link");
        }

        const path = splitResult[0];
        const searchParams = new URLSearchParams(splitResult[1]);

        const tableSelectionType = searchParams.get("type");
        const formName = searchParams.get("form");
        const formProperty = searchParams.get("property");

        const startWith = parseInt(searchParams.get("@startwith"));
        const pageIndex = (startWith + 1).toString();
        const pageSize = searchParams.get("@pagesize");

        const sort = searchParams.get("@sort");
        const fields = searchParams.get("properties").split(',');

        return {
            width,
            height,
            path,
            tableSelectionType,
            formName,
            formProperty,
            pageIndex,
            pageSize,
            sort,
            fields
        }
    }

    /** 
     * from roundup docs rest api url - "{host}/{tracker}            label.style.textTransform = "capitalize";label.style.textTransform = "capitalize";/rest/data/{class}"
     * we pass helpurl which is parsed from anchor tag and return a URL.
     * @param {Object} props
     * @param {string} props.path
     * @param {number} props.pageIndex
     * @param {number} props.pageSize
     * @param {string[] | string} props.fields
     * @param {string} [props.sort]
     * @returns {URL} */
    static getRestURL(props) {
        const restDataPath = "rest/data";
        const origin = window.location.origin;
        const tracker = window.location.pathname.split('/')[1];
        if (!tracker || tracker < 1) {
            throw new Error("error parsing tracker name from window url");
        }

        const base = origin + "/" + tracker + "/" + restDataPath + "/" + props.path;
        let url = new URL(base);

        url.searchParams.append("@page_index", props.pageIndex);
        url.searchParams.append("@page_size", props.pageSize);
        let fields = Array.isArray(props.fields) ? props.fields.join(',') : props.fields;
        url.searchParams.append("@fields", fields);

        if (props.sort) {
            url.searchParams.append("@sort", props.sort);
        }

        return url;
    }

    static getSearchURL(props, formData) {
        const url = new URL(ClassHelper.getRestURL(props).toString());
        for (let entry of formData.entries()) {
            if (entry[1] != null && entry[1] != "") {
                url.searchParams.append(entry[0], entry[1]);
            }
        }
        return url;
    }

    getSearchFragment() {
        const fragment = document.createDocumentFragment();
        const form = document.createElement("form");
        form.setAttribute("id", "popup-search");

        const params = this.getAttribute("searchWith").split(',');

        const table = document.createElement("table");

        for (var param of params) {
            const row = document.createElement("tr");
            const labelCell = document.createElement("td");
            const inputCell = document.createElement("td");

            const label = document.createElement("label");
            label.textContent = param + ":";
            label.setAttribute("for", param);
            label.style.textTransform = "capitalize";

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
        search.textContent = ClassHelper.translations["Search"];
        search.addEventListener("click", (e) => {
            e.preventDefault();
            let fd = new FormData(form);
            this.dispatchEvent(new CustomEvent("search", {
                detail: {
                    value: fd
                }
            }));
        });

        const reset = document.createElement("button");
        reset.textContent = ClassHelper.translations["Reset"];
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
    }

    getPaginationFragment(prevUrl, nextUrl, index, size) {
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
                        value: prevUrl
                    }
                }));
            });
            a.textContent = ClassHelper.translations["Prev"];
            prev.appendChild(a);
        }
        const info = document.createElement('td');
        info.textContent = `${1 + (parseInt(index) - 1) * parseInt(size)}..${parseInt(index) * parseInt(size)}`;
        const next = document.createElement('td');
        if (nextUrl) {
            const a = document.createElement('button');
            a.addEventListener("click", () => {
                this.dispatchEvent(new CustomEvent("nextPage", {
                    detail: {
                        value: nextUrl
                    }
                }));
            });
            a.textContent = ClassHelper.translations["Next"];
            next.appendChild(a);
        }

        tr.append(prev, info, next);
        table.appendChild(tr);
        fragment.appendChild(table);
        return fragment;
    }

    getAccumulatorFragment(preSelectedValues) {
        const fragment = document.createDocumentFragment();
        const div = document.createElement("div");
        div.setAttribute("id", "popup-control");

        const preview = document.createElement("input");
        preview.setAttribute("id", "popup-preview");
        preview.type = "text";
        preview.name = "preview";
        if (preSelectedValues.length > 0) {
            preview.value = preSelectedValues.join(',');
        }

        const cancel = document.createElement("button");
        cancel.textContent = ClassHelper.translations["Cancel"];
        cancel.addEventListener("click", () => {
            this.dispatchEvent(new CustomEvent("valueSelected", {
                detail: {
                    value: preview.value
                }
            }));
        })

        const apply = document.createElement("button");
        apply.textContent = ClassHelper.translations["Apply"];
        apply.style.fontWeight = "bold";
        apply.addEventListener("click", () => {
            this.dispatchEvent(new CustomEvent("valueSelected", {
                detail: {
                    value: preview.value
                }
            }))
        })

        const style = document.createElement("style");

        style.textContent = `
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
          }`;

        div.append(preview, cancel, apply);

        fragment.appendChild(div, style);

        return fragment;
    }

    /**
     * 
     * @param {string[]} headers 
     * @param {Object.<string, any>[]} data 
     * @returns 
     */
    getTableFragment(headers, data, preSelectedValues) {
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
            if (preSelectedValues.includes(entry[headers[0]])) {
                checkbox.checked = true;
            }

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

    /**
     * 
     * @param {Object} props 
     * @param {string} props.width
     * @param {string} props.height
     * @param {string[] | string} props.fields
     * @returns {Window}
     */
    openPopUp(apiURL, props) {
        let popupFeatures = "popup=yes";
        popupFeatures += ",width=" + props.width;
        popupFeatures += ",height=" + props.height;

        this.popupRef = window.open("about:blank", "_blank", popupFeatures);

        const input = document.getElementsByName(props.formProperty)[0];
        let preSelectedValues = [];
        if (input.value) {
            preSelectedValues = input.value.split(',');
        }

        const json = fetch(apiURL).then(resp => {
            if (!resp.ok) {
                throw new Error("error fetching data from roundup rest api");
            }
            return resp.json();
        }).catch(error => {
            throw new Error("error parsing json from roundup rest api");
        });

        json.then(result => {
            const data = result.data;
            let prevURL = data["@links"].prev;
            if (prevURL) {
                prevURL = prevURL[0].uri;
            }

            let nextURL = data["@links"].next;
            if (nextURL) {
                nextURL = nextURL[0].uri;
            }

            const b = this.popupRef.document.body;
            if (this.getAttribute("searchWith")) {
                b.appendChild(this.getSearchFragment());
            }
            b.appendChild(this.getPaginationFragment(prevURL, nextURL, props.pageIndex, props.pageSize));
            b.appendChild(this.getTableFragment(props.fields, data.collection, preSelectedValues));
            b.appendChild(this.getAccumulatorFragment(preSelectedValues));
        })

    }

    pageChange(apiURL, props) {
        let preSelectedValues = this.popupRef.document.getElementById("popup-preview").value.split(",");

        fetch(apiURL).then(resp => resp.json()).then(({ data }) => {
            const b = this.popupRef.document.body;
            let prevURL = data["@links"].prev ?? null;
            if (prevURL) {
                prevURL = prevURL[0].uri;
            }
            let nextURL = data["@links"].next ?? null;
            if (nextURL) {
                nextURL = nextURL[0].uri;
            }
            let selfUrl = new URL(data["@links"].self[0].uri);
            props.pageIndex = selfUrl.searchParams.get("@page_index");

            let oldPagination = this.popupRef.document.getElementById("popup-pagination");
            b.replaceChild(this.getPaginationFragment(prevURL, nextURL, props.pageIndex, props.pageSize), oldPagination);
            let oldTable = this.popupRef.document.getElementById("popup-table");
            b.replaceChild(this.getTableFragment(props.fields, data.collection, preSelectedValues), oldTable);
        });
    }

    valueSelected(props, value) {
        const input = window.document.querySelector(`form[name="${props.formName}"] input[name="${props.formProperty}"]`);
        input.value = value;
        this.popupRef.close();
    }

    searchEvent(apiURL, props) {
        fetch(apiURL).then(resp => resp.json()).then(({ data }) => {
            const b = this.popupRef.document.body;
            let oldTable = this.popupRef.document.getElementById("popup-table");
            b.replaceChild(this.getTableFragment(props.fields, data.collection), oldTable);
        });
    }

    selectionEvent(value) {
        const preview = this.popupRef.document.getElementById("popup-preview");
        if (preview.value == "" || preview.value == null) {
            preview.value = value
        } else {
            const values = preview.value.split(',');
            const exists = values.findIndex(v => v == value.toString());

            if (exists > -1) {
                values.splice(exists, 1);
                preview.value = values.join(',');
            } else {
                preview.value += ',' + value;
            }
        }
    }
}

function enableClassHelper() {
    if (document.URL.endsWith("#classhelper-wc-toggle")) {
        return;
    }

    /**@todo - make api call? get 404 then early return? */
    // http://localhost/demo/rest

    customElements.define("roundup-classhelper", ClassHelper);
}

enableClassHelper();