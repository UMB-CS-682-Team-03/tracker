class ClassHelper extends HTMLElement {
    /** @type {Window} */
    popupRef = null;

    connectedCallback() {
        let link = this.querySelectorAll("a");
        if (link.length < 1 || link.length > 1) {
            throw new Error("roundup-classhelper must wrap a single classhelp link");
        }
        link = link.item(0);
        link.onclick = null;

        const linkProp = ClassHelper.parseLink(link);

        /**
         * @todo remove this after asking about the bug
         */
        if (linkProp.path == "user") {
            linkProp.fields = ['username', 'realname', 'phone', 'organisation', 'roles'];
        }

        const apiURL = ClassHelper.getRestURL(linkProp);

        // Listeners
        link.addEventListener("click", (event) => {
            event.preventDefault();
            this.openPopUp(apiURL, linkProp);
        });
        this.addEventListener("nextPage", (event) => {
            linkProp.pageIndex = (parseInt(linkProp.pageIndex) + 1).toString();
            this.pageChange(event.detail.url, linkProp);
        });
        this.addEventListener("prevPage", (event) => {
            linkProp.pageIndex = (parseInt(linkProp.pageIndex) - 1).toString();
            this.pageChange(event.detail.url, linkProp);
        });
        this.addEventListener("valueSelected", (event) => {
            this.valueSelected(linkProp, event.detail.value);
        });
        this.addEventListener("search", (event) => {
            const searchURL = ClassHelper.getSearchURL(linkProp, event.detail.data);

            this.searchEvent(searchURL, linkProp);
        });
        this.addEventListener("selection", (event) => {
            this.selectionEvent(event.detail.value);
        });
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
     * from roundup docs rest api url - "{host}/{tracker}/rest/data/{class}"
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
        for (var param of params) {
            const prop = document.createElement("div");
            const input = document.createElement("input");
            input.setAttribute("name", param);
            const label = document.createElement("label");
            label.textContent = param;
            label.setAttribute("for", param);

            prop.appendChild(label);
            prop.appendChild(input);
            form.appendChild(prop);
        }

        const search = document.createElement("button");
        search.textContent = "Search";
        const reset = document.createElement("button");
        reset.textContent = "Reset";

        search.addEventListener("click", (e) => {
            e.preventDefault()
            let fd = new FormData(form);
            this.dispatchEvent(new CustomEvent("search", {
                detail: {
                    data: fd
                }
            }));
        });

        reset.addEventListener("click", (e) => {
            e.preventDefault();
            form.reset();
        })

        form.appendChild(search);
        form.appendChild(reset);

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
                        url: prevUrl
                    }
                }));
            });
            a.textContent = `<<previous`;
            prev.appendChild(a);
        }
        const info = document.createElement('td');
        info.textContent = `${index}..${parseInt(index) * parseInt(size)}`;
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
        apply.addEventListener("click", () => {
            this.dispatchEvent(new CustomEvent("valueSelected", {
                detail: {
                    value: preview.value
                }
            }))
        })

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

        // Create table headers
        const headerRow = document.createElement('tr');
        let thx = document.createElement("th");
        thx.textContent = "x";
        headerRow.appendChild(thx)

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

        // Assemble the table
        table.appendChild(thead);
        table.appendChild(tbody);
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
            b.appendChild(this.getTableFragment(props.fields, data.collection));
            b.appendChild(this.getAccumulatorFragment());
        })

    }

    pageChange(apiURL, props) {
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

            let oldPagination = this.popupRef.document.getElementById("popup-pagination");
            b.replaceChild(this.getPaginationFragment(prevURL, nextURL, props.pageIndex, props.pageSize), oldPagination);
            let oldTable = this.popupRef.document.getElementById("popup-table");
            b.replaceChild(this.getTableFragment(props.fields, data.collection), oldTable);
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

customElements.define("roundup-classhelper", ClassHelper);