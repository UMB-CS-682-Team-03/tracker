/**
 * @typedef {Object} ClassHelperProps
 * @property {string} origin
 * @property {string} tracker
 * @property {number} width
 * @property {number} height
 * @property {string} apiClassName
 * @property {string} tableSelectionType
 * @property {string} formName
 * @property {string} formProperty
 * @property {number} pageIndex
 * @property {number} pageSize
 * @property {string[]} sort
 * @property {string[]} fields
 */

// Let user customize the css file name
const CSS_FILE_NAME = "@@file/classhelper.css";

class ClassHelper extends HTMLElement {
    /** @type {Window} */
    popupRef = null;
    static translations = null;

    connectedCallback() {
        /** @type {HTMLAnchorElement} */
        let link;

        /** @type {ClassHelperProps} */
        let properties;

        /** @type {URL} */
        let apiURL;

        try {
            link = this.findClassHelpLink();
        } catch (e) {
            console.error(e.message);
            return;
        }

        let script = link.getAttribute("onclick");
        link.setAttribute("onclick", "");
        const preventDefault = e => e.preventDefault();
        link.addEventListener("click", preventDefault);

        try {
            properties = ClassHelper.parseHelpUrlData(link);
            apiURL = ClassHelper.getRestURL(properties);
        } catch (e) {
            // Failed parsing props -> reset, log and return.
            link.removeEventListener("click", preventDefault);
            link.setAttribute("onclick", script);
            console.error(e.message);
            return;
        }

        ClassHelper.fetchTranslations().catch(error => {
            // Top level handling for translation errors.
            // Fallbacks to use english keywords.
            /** @todo think about the showing it to user */
            console.error(error.message);
        });

        const openPopUpClosure = (event) => {
            this.openPopUp(apiURL, properties).catch(error => {
                // Top level error handling for openPopUp method.
                this.removeEventListener("click", openPopUpClosure);
            });
        };
        this.addEventListener("click", openPopUpClosure);

        const nextPageClosure = (event) => {
            this.pageChange(event.detail.value, properties).catch(error => {
                // Top level error handling for nextPage method.
                this.removeEventListener("click", nextPageClosure);
            });
        }
        this.addEventListener("nextPage", nextPageClosure);

        const prevPageClosure = (event) => {
            this.pageChange(event.detail.value, properties).catch(error => {
                // Top level error handling for prevPage method.
                this.removeEventListener("click", prevPageClosure);
            });
        }
        this.addEventListener("prevPage", prevPageClosure);

        const valueSelectedClosure = (event) => {
            this.valueSelected(properties, event.detail.value);
        }
        this.addEventListener("valueSelected", valueSelectedClosure);

        const searchClosure = (event) => {
            const searchURL = ClassHelper.getSearchURL(properties, event.detail.value);
            this.searchEvent(searchURL, properties).catch(error => {
                // Top level error handling for searchEvent method.
                this.removeEventListener("click", searchClosure);
            });
        }
        this.addEventListener("search", searchClosure);

        const selectionClosure = (event) => {
            this.selectionEvent(event.detail.value).catch(error => {
                // Top level error handling for selectionEvent method.
                this.removeEventListener("click", selectionClosure);
            });
        }
        this.addEventListener("selection", selectionClosure);
    }

    attributeChangedCallback(name, oldValue, _newValue) {
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
        // Singleton implementation
        if (ClassHelper.translations != null) {
            return;
        }

        let translations = {
            "Apply": "Apply",
            "Cancel": "Cancel",
            "Next": "Next",
            "Prev": "Prev",
            "Search": "Search",
            "Reset": "Reset"
        };

        let tracker = window.location.pathname.split('/')[1];
        let url = new URL(window.location.origin + "/" + tracker);
        url.searchParams.append("@template", "json");
        url.searchParams.append("properties", Object.keys(translations).join(','));

        let resp;
        try {
            resp = await fetch(url);
            if (!resp.ok) throw new Error();
        } catch (error) {
            console.error(error);
            throw new Error("error fetching translations from roundup rest api");
        }

        try {
            ClassHelper.translations = await resp.json();
        } catch (error) {
            // Default to english translations
            ClassHelper.translations = translations;
            throw new Error("error parsing translation json from roundup rest api");
        }
    }

    /**
     * Find the anchor tag that provides the classhelp link.
     * @returns {HTMLAnchorElement}
     */
    findClassHelpLink() {
        const links = this.querySelectorAll("a");
        if (links.length != 1) {
            throw new Error("roundup-classhelper must wrap a single classhelp link");
        }
        return links.item(0);
    }

    /**
     * This method parses the helpurl link to get the necessary data for the classhelper.
     * @param {HTMLAnchorElement} link
     * @returns {ClassHelperProps}
     */
    static parseHelpUrlData(link) {
        if (!link.dataset.helpurl) {
            throw new Error("roundup-classhelper link must have a data-helpurl attribute");
        }

        if (!link.dataset.width) {
            throw new Error("roundup-classhelper link must have a data-width attribute");
        }

        if (!link.dataset.height) {
            throw new Error("roundup-classhelper link must have a data-height attribute");
        }

        const width = parseInt(link.dataset.width);
        if (isNaN(width)) {
            throw new Error("width in helpurl must be a number");
        }

        const height = parseInt(link.dataset.height);
        if (isNaN(height)) {
            throw new Error("height in helpurl must be a number");
        }

        const urlParts = link.dataset.helpurl.split("?");

        if (urlParts.length != 2) {
            throw new Error("invalid helpurl from link");
        }

        const apiClassName = urlParts[0];
        const searchParams = new URLSearchParams(urlParts[1]);

        const tableSelectionType = searchParams.get("type");
        const formName = searchParams.get("form");
        const formProperty = searchParams.get("property");

        const startWith = parseInt(searchParams.get("@startwith"));
        if (isNaN(startWith)) {
            throw new Error("startwith in helpurl must be a number");
        }

        const pageIndex = startWith + 1;
        const pageSize = parseInt(searchParams.get("@pagesize"));

        if (isNaN(pageSize)) {
            throw new Error("pagesize in helpurl must be a number");
        }

        const sort = searchParams.get("@sort")?.split(",");
        const fields = searchParams.get("properties")?.split(",");

        const origin = window.location.origin;
        const tracker = window.location.pathname.split('/')[1];
        if (!tracker) {
            throw new Error("error parsing tracker name from window url");
        }

        return {
            width,
            height,
            apiClassName,
            tableSelectionType,
            formName,
            formProperty,
            pageIndex,
            pageSize,
            sort,
            fields,
            origin,
            tracker
        }
    }

    /** 
     * from roundup docs rest api url - "{host}/{tracker}
     * we pass helpurl which is parsed from anchor tag and return a URL.
     * @param {ClassHelperProps} props
     * @returns {URL}
     * @throws {Error}
     */
    static getRestURL(props) {
        const restDataPath = "rest/data";
        const origin = window.location.origin;
        const tracker = window.location.pathname.split('/')[1];
        if (!tracker || tracker < 1) {
            throw new Error("error parsing tracker name from window url");
        }

        const base = origin + "/" + tracker + "/" + restDataPath + "/" + props.apiClassName;
        let url = new URL(base);

        url.searchParams.append("@page_index", props.pageIndex);
        url.searchParams.append("@page_size", props.pageSize);
        let fields = props.fields.join(',');
        url.searchParams.append("@fields", fields);

        if (props.sort) {
            let sort = props.sort.join(',');
            url.searchParams.append("@sort", sort);
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

        const divsearch = document.createElement("div");
        divsearch.classList.add("popup-divsearch"); // Add class for styling

        const form = document.createElement("form");
        form.classList.add("popup-search"); // Add class for styling

        const params = this.getAttribute("searchWith").split(',');

        const table = document.createElement("table");
        table.classList.add("search-table"); // Add class for styling

        for (var param of params) {
            const row = document.createElement("tr");
            const labelCell = document.createElement("td");
            const inputCell = document.createElement("td");

            const label = document.createElement("label");
            label.setAttribute("class", "searchlabel");
            label.textContent = param + ":";
            label.setAttribute("for", param);
            label.classList.add("search-label"); // Add class for styling

            if (param === "username" || param === "phone" || param === "roles") {
                label.classList.add("bold-label"); // Add class for styling
            }

            const input = document.createElement("input");
            input.setAttribute("name", param);
            input.setAttribute("id", param);
            input.classList.add("search-input"); // Add class for styling

            labelCell.appendChild(label);
            row.appendChild(labelCell);

            inputCell.appendChild(input);
            row.appendChild(inputCell);

            table.appendChild(row);
        }

        // Add search and reset buttons
        const buttonRow = document.createElement("tr");
        const emptyButtonCell = document.createElement("td");
        const buttonCell = document.createElement("td");
        buttonCell.colSpan = 1;

        const search = document.createElement("button");
        search.textContent = ClassHelper.translations["Search"];
        search.classList.add("search-button"); // Add class for styling
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
        reset.setAttribute("class", "resetmargin");
        reset.classList.add("reset-button"); // Add class for styling
        reset.addEventListener("click", (e) => {
            e.preventDefault();
            form.reset();
        });

        buttonCell.appendChild(search);
        buttonCell.appendChild(reset);
        buttonRow.appendChild(emptyButtonCell);
        buttonRow.appendChild(buttonCell);

        table.appendChild(buttonRow);

        form.appendChild(table);
        divsearch.appendChild(form);
        fragment.appendChild(divsearch);

        return fragment;
    }

    getPaginationFragment(prevUrl, nextUrl, index, size) {
        const fragment = document.createDocumentFragment();
        const table = document.createElement('table');
        table.setAttribute("class", "popup-pagination");
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
            a.setAttribute("class", "button-pagination");
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
        const divacc = document.createElement("div");
        divacc.setAttribute("class", "popup-control");

        const preview = document.createElement("input");
        preview.setAttribute("class", "popup-preview");
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
        });

        const apply = document.createElement("button");
        apply.setAttribute("class", "acc-apply");
        apply.textContent = ClassHelper.translations["Apply"];
        apply.addEventListener("click", () => {
            this.dispatchEvent(new CustomEvent("valueSelected", {
                detail: {
                    value: preview.value
                }
            }))
        })

        divacc.append(preview, cancel, apply);
        fragment.appendChild(divacc);

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

        const divtable = document.createElement('div');
        divtable.setAttribute("class", "popup-divtable");

        const table = document.createElement('table');
        table.setAttribute("class", "popup-table");
        const thead = document.createElement('thead');
        const tbody = document.createElement('tbody');
        const tfoot = document.createElement('tfoot'); // Create table footer

        // Create table headers
        const headerRow = document.createElement('tr');
        let thx = document.createElement("th");
        thx.textContent = "X";
        thx.setAttribute("class", "tableheader");
        headerRow.appendChild(thx);

        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            if (header === "ID") {
                th.setAttribute("class", "tableid"); // Set width for column
            }
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);

        // Create table body with data
        data.forEach(entry => {
            const row = document.createElement('tr');

            const checkbox = document.createElement("input");
            checkbox.setAttribute("type", "checkbox");

            row.appendChild(checkbox);
            row.setAttribute("class", "rowstyle");
            if (preSelectedValues.includes(entry[headers[0]])) {
                checkbox.checked = true;
            }

            headers.forEach(header => {
                const td = document.createElement('td');
                td.textContent = entry[header];
                row.appendChild(td);
            });

            row.addEventListener("click", (e) => {
                console.log(e.target);
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
        footThx.setAttribute("class", "footerstyle");
        footerRow.appendChild(footThx);

        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            footerRow.appendChild(th);
        });
        tfoot.appendChild(footerRow);

        // Assemble the table
        table.appendChild(thead);
        table.appendChild(tbody);
        table.appendChild(tfoot); // Append the footer

        divtable.appendChild(table);

        fragment.appendChild(divtable);

        return fragment;
    }

    /**
     * main method called when classhelper is clicked
     * @param {URL | string} apiURL
     * @param {ClassHelperProps} props 
     * @throws {Error} when fetching or parsing data from roundup rest api fails
     */
    async openPopUp(apiURL, props) {
        // Find preselected values
        const input = document.getElementsByName(props.formProperty).item(0);
        let preSelectedValues = [];
        if (input.value) {
            preSelectedValues = input.value.split(',');
        }

        const popupFeatures = `popup=yes,width=${props.width},height=${props.height}`;
        this.popupRef = window.open("about:blank", "_blank", popupFeatures);

        let resp;
        try {
            resp = await fetch(apiURL);
        } catch (error) {
            // Show message fail to load data
            throw new Error("error fetching data from roundup rest api");
        }

        let json;
        try {
            json = await resp.json();
        } catch (error) {
            // Show message fail to parse json
            throw new Error("error parsing json from roundup rest api");
        }

        const data = json.data;
        const links = json.data["@links"];

        let prevPageURL, nextPageURL;

        if (links.prev && links.prev.length > 0) {
            prevPageURL = links.prev[0].uri;
        }
        if (links.next && links.next.length > 0) {
            nextPageURL = links.next[0].uri;
        }

        const popupDocument = this.popupRef.document;
        const popupBody = popupDocument.body;
        const popupHead = popupDocument.head;

        // Add external classhelper css to head
        const css = popupDocument.createElement("link");
        css.rel = "stylesheet";
        css.type = "text/css";
        css.href = props.origin + '/' + props.tracker + '/' + CSS_FILE_NAME;
        popupHead.appendChild(css);

        popupBody.classList.add("flex-container");

        if (this.getAttribute("searchWith")) {
            const searchFrag = this.getSearchFragment();
            popupBody.appendChild(searchFrag);
        }

        const paginationFrag = this.getPaginationFragment(prevPageURL, nextPageURL, props.pageIndex, props.pageSize);
        popupBody.appendChild(paginationFrag);

        const tableFrag = this.getTableFragment(props.fields, data.collection, preSelectedValues);
        popupBody.appendChild(tableFrag);

        const separator = popupDocument.createElement("div");
        separator.classList.add("separator");
        popupBody.appendChild(separator);

        const accumulatorFrag = this.getAccumulatorFragment(preSelectedValues);
        popupBody.appendChild(accumulatorFrag);
    }

    /** method when next or previous button is clicked
     * @param {URL | string} apiURL
     * @param {ClassHelperProps} props
     * @throws {Error} when fetching or parsing data from roundup rest api fails
     */
    async pageChange(apiURL, props) {
        let accumulatorValues = this.popupRef.document.getElementsByClassName("popup-preview").item(0).value.split(",");

        let resp;
        try {
            resp = await fetch(apiURL);
        } catch (error) {
            // Show message fail to load data
            throw new Error("error fetching data from roundup rest api");
        }

        let json;
        try {
            json = await resp.json();
        } catch (error) {
            // Show message fail to parse json
            throw new Error("error parsing json from roundup rest api");
        }

        const data = json.data;
        const links = json.data["@links"];

        let prevPageURL, nextPageURL, selfPageURL;

        if (links.prev && links.prev.length > 0) {
            prevPageURL = links.prev[0].uri;
        }
        if (links.next && links.next.length > 0) {
            nextPageURL = links.next[0].uri;
        }
        if (links.self && links.self.length > 0) {
            selfPageURL = new URL(links.self[0].uri);
        }

        const popupBody = this.popupRef.document.body;
        props.pageIndex = selfPageURL.searchParams.get("@page_index");

        const oldPaginationFrag = popupBody.getElementsByClassName("popup-pagination").item(0);
        const newPaginationFrag = this.getPaginationFragment(prevPageURL, nextPageURL, props.pageIndex, props.pageSize);
        popupBody.replaceChild(newPaginationFrag, oldPaginationFrag);

        let oldTableFrag = popupBody.getElementsByClassName("popup-divtable").item(0);
        let newTableFrag = this.getTableFragment(props.fields, data.collection, accumulatorValues);
        popupBody.replaceChild(newTableFrag, oldTableFrag);
    }

    /** method when a value is selected in 
     * @param {ClassHelperProps} props
     * @param {string} value
     */
    valueSelected(props, value) {
        const input = document.getElementsByName(props.formProperty).item(0);
        input.value = value;
        this.popupRef.close();
    }

    /** method when search is performed within classhelper, here we need to update the classhelper table with search results
     * @param {URL | string} apiURL
     * @param {ClassHelperProps} props
     * @throws {Error} when fetching or parsing data from roundup rest api fails
     */
    async searchEvent(apiURL, props) {
        let accumulatorValues = this.popupRef.document.getElementsByClassName("popup-preview").item(0).value.split(",");

        let resp;
        try {
            resp = await fetch(apiURL);
        } catch (error) {
            // Show message fail to load data
            throw new Error("error fetching data from roundup rest api");
        }

        let json;
        try {
            json = await resp.json();
        } catch (error) {
            // Show message fail to parse json
            throw new Error("error parsing json from roundup rest api");
        }

        const data = json.data;
        const links = json.data["@links"];

        let prevPageURL, nextPageURL, selfPageURL;

        if (links.prev && links.prev.length > 0) {
            prevPageURL = links.prev[0].uri;
        }
        if (links.next && links.next.length > 0) {
            nextPageURL = links.next[0].uri;
        }
        if (links.self && links.self.length > 0) {
            selfPageURL = new URL(links.self[0].uri);
        }

        const popupBody = this.popupRef.document.body;
        props.pageIndex = selfPageURL.searchParams.get("@page_index");

        if (prevPageURL || nextPageURL) {
            const oldPaginationFrag = popupBody.getElementsByClassName("popup-pagination").item(0);
            const newPaginationFrag = this.getPaginationFragment(prevPageURL, nextPageURL, props.pageIndex, props.pageSize);
            popupBody.replaceChild(newPaginationFrag, oldPaginationFrag);
        }

        let oldTableFrag = popupBody.getElementsByClassName("popup-divtable").item(0);
        let newTableFrag = this.getTableFragment(props.fields, data.collection, accumulatorValues);
        popupBody.replaceChild(newTableFrag, oldTableFrag);
    }

    /** method when an entry in classhelper table is selected
     * @param {string} value
     */
    selectionEvent(value) {
        const preview = this.popupRef.document.getElementsByClassName("popup-preview").item(0);
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