/**
 * Properties for the ClassHelper component, 
 * made into a type for better readability.
 * @typedef {Object} HelpUrlProps
 * Type of data that needs to be shown (eg. issue, user, keywords) parsed from helpurl
 * @property {string} apiClassName
 * @property {number} width // width of the popup window
 * @property {number} height // height of the popup window
 * The form on which the classhelper is being used
 * @property {string | null} formName
 * The form property on which the classhelper is being used
 * @property {string | null} formProperty
 * @property {string | null} tableSelectionType // it has to be "checkbox" or "radio"(if any)
 * The fields on which the table is sorted
 * @property {string[] | undefined} sort
 * The actual fields to be displayed in the table
 * @property {string[] | undefined} fields
 * @property {number} pageIndex
 * @property {number} pageSize
 */

// Let user customize the css file name
const CSS_FILE_NAME = "@@file/classhelper.css";

const CLASSHELPER_TAG_NAME = "roundup-classhelper";

/**
 * This is a custom web component(user named html tag) that wraps a helpurl link 
 * and provides additional functionality.
 * 
 * The classhelper is an interactive popup window that displays a table of data.
 * Users can interact with this window to search, navigate and select data from the table.
 * The selected data is either "Id" or "a Value" from the table row.
 * There can be multiple selections in the table.
 * The selected data is then populated in a form field in the main window.
 * 
 * How to use.
 * ------------
 * The helpurl must be wrapped under this web component(user named html tag).
 * ```html
 * <roundup-classhelper searchWith="title,status[],keyword[]+name">
 *   ( helpurl template here, this can be tal, chameleon, jinja2.
 *     In HTML DOM this is an helpurl anchor tag.
 *    )
 * </roundup-classhelper>
 * ```
 * 
 * The searchWith attribute of the web component is optional.
 * 
 * searchWith attribute value is a list of comma separated names of table data fields.
 * (It is possible that a data field is present in search form but absent in the table).
 * 
 * A square parentheses open+close ("[]") can be added to the column name eg."status[]",
 * this will make that search field as a dropdown in the search form in popup window, 
 * then a user can see all the possible values that column can have.
 * 
 * eg. searchWith="title,status[],keyword[]+name" where status can have values like "open", 
 * "closed" a dropdown will be shown with null, open and closed. This is an aesthetic usage 
 * instead of writing in a text field for options in status.
 * 
 * A plus sign or minus sign with data field can be used to specify the sort order of the dropdown.
 * In the above example, keyword[]+name will sort the dropdown in ascending order(a-z) of name of the keyword.
 * A value keyword[]-name will sort the dropdown in descending order(z-a) of name of the keyword.
 * 
 * searchWith="<<column name>>[]{+|-}{id|name}"
 * Here column name is required,
 * optionally there can be [] for a dropdown,
 * optionally with "[]" present to a column name there can be 
 * [+ or -] with succeeding "id" or "name" for sorting dropdown.
 * 
 */
class ClassHelper extends HTMLElement {
    /** @type {Window} handler to popup window */
    popupRef = null;

    /** 
     * Result from making a call to the rest api, for the translation keywords.
     * @type {Object.<string, string>} */
    static translations = null;

    /** 
     * Stores the result from api calls made to rest api,
     * for the parameters in searchWith attribute of this web component
     * where a parameter is defined as a dropdown in 
     * @type {Object.<string, Map.<string, string>>} */
    dropdowns = null;

    /** @type {HTMLAnchorElement} */
    helpurl = null;
    helpurlScript = null;

    /** @type {HelpUrlProps} */
    helpurlProps = null;

    /** no-op function */
    preventDefault = e => e.preventDefault();

    /** 
     * The qualified domain name with protocol and port(if any)
     * with the tracker name if any.
     * eg. http://localhost:8080/demo or https://demo.roundup-tracker.org
     * @type {string} */
    trackerBaseURL = null;

    connectedCallback() {
        try {
            this.helpurl = this.findClassHelpLink();

            // Removing the helpurl click behavior
            this.helpurlScript = this.helpurl.getAttribute("onclick");
            this.helpurl.setAttribute("onclick", "");
            this.helpurl.addEventListener("click", this.preventDefault);

            this.helpurlProps = ClassHelper.parseHelpUrlProps(this.helpurl);

            this.trackerBaseURL = window.location.href.substring(0, window.location.href.lastIndexOf("/"));

        } catch (err) {
            console.warn("Classhelper not intercepting helpurl.");
            if (this.helpurl != null) {
                this.helpurl.removeEventListener("click", this.preventDefault);
                this.helpurl.setAttribute("onclick", this.helpurlScript);
            }
            console.error(err);
            return;
        }

        const initialRequestURL = ClassHelper.getRestURL(this.trackerBaseURL, this.helpurlProps);

        ClassHelper.fetchTranslations().catch(error => {
            console.warn("Classhelper failed in translating.")
            console.error(error);
        });

        this.fetchDropdowns().catch(error => {
            // Top level handling for dropdowns errors.
            console.error(error);
        });

        const cleanUpClosure = () => {
            this.removeEventListener("click", handleClickEvent);
            this.helpurl.removeEventListener("click", this.preventDefault);
            this.helpurl.setAttribute("onclick", this.helpurlScript);
        }

        const handleClickEvent = (event) => {
            this.openPopUp(initialRequestURL, this.helpurlProps).catch(error => {
                // Top level error handling for openPopUp method.
                cleanUpClosure();
            });
        };

        const handleNextPageEvent = (event) => {
            this.pageChange(event.detail.value, this.helpurlProps).catch(error => {
                // Top level error handling for nextPage method.
                this.removeEventListener("nextPage", handleNextPageEvent);
                cleanUpClosure();
            });
        }

        const handlePrevPageEvent = (event) => {
            this.pageChange(event.detail.value, this.helpurlProps).catch(error => {
                // Top level error handling for prevPage method.
                this.removeEventListener("prevPage", handlePrevPageEvent);
                cleanUpClosure();
            });
        }

        const handleValueSelectedEvent = (event) => {
            // does not throw error
            this.valueSelected(this.helpurlProps, event.detail.value);
        }

        const handleSearchEvent = (event) => {
            this.helpurlProps.pageIndex = 1;
            const searchURL = ClassHelper.getSearchURL(this.trackerBaseURL, this.helpurlProps, event.detail.value);
            this.searchEvent(searchURL, this.helpurlProps).catch(error => {
                // Top level error handling for searchEvent method.
                this.removeEventListener("search", handleSearchEvent);
                cleanUpClosure();
            });
        }

        const handleSelectionEvent = (event) => {
            // does not throw error
            this.selectionEvent(event.detail.value);
        }

        this.addEventListener("click", handleClickEvent);
        this.addEventListener("prevPage", handlePrevPageEvent);
        this.addEventListener("nextPage", handleNextPageEvent);
        this.addEventListener("valueSelected", handleValueSelectedEvent);
        this.addEventListener("search", handleSearchEvent);
        this.addEventListener("selection", handleSelectionEvent);
    }

    attributeChangedCallback(name, oldValue, _newValue) {
        if (name === "searchWith") {
            if (!oldValue || oldValue === _newValue) {
                return;
            }
            this.fetchDropdowns().catch(error => {
                // Top level handling for dropdowns errors.
                console.error(error.message);
            });

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
        ClassHelper.translations = translations;

        let tracker = window.location.pathname.split('/')[1];
        let url = new URL(window.location.origin + "/" + tracker);
        url.searchParams.append("@template", "json");
        url.searchParams.append("properties", Object.keys(translations).join(','));

        let resp;
        try {
            resp = await fetch(url);
            if (!resp.ok) throw new Error("Not 2xx status code.", { cause: resp });
        } catch (error) {
            throw new Error("error fetching translations from roundup rest api", { cause: error });
        }

        try {
            ClassHelper.translations = await resp.json();
        } catch (error) {
            throw new Error("error parsing translation json from roundup rest api", { cause: error });
        }
    }

    async fetchDropdowns() {
        // Singleton implementation
        if (this.dropdowns != null) {
            return;
        }
        this.dropdowns = {};

        if (this.getAttribute("searchWith") == null) {
            return;
        }

        const params = this.getAttribute("searchWith").split(',');

        for (let param of params) {
            if (param.includes("[]")) {
                const segments = param.split("[]");
                param = segments[0];
                const sortOrder = segments[1];
                let url = `${this.trackerBaseURL}/rest/data/${param}?@fields=id,name`;
                if (sortOrder) {
                    url += `&@sort=${sortOrder}`;
                }

                let resp;
                try {
                    resp = await fetch(url);
                    if (!resp.ok) throw new Error("Not 2xx status code.", { cause: resp });
                } catch (error) {
                    throw new Error("error fetching dropdowns from roundup rest api", { cause: error });
                }

                let json;
                try {
                    json = await resp.json();
                } catch (error) {
                    throw new Error("error parsing dropdown json from roundup rest api");
                }

                let list = new Map();
                for (let entry of json.data.collection) {
                    list.set(entry.id, entry.name);
                }

                this.dropdowns[param] = list;
            }
        }
    }

    /**
     * Find the anchor tag that provides the classhelp link.
     * @returns {HTMLAnchorElement}
     * @throws {Error} when the anchor tag is not classhelp link
     */
    findClassHelpLink() {
        const links = this.querySelectorAll("a");
        if (links.length != 1) {
            throw new Error("roundup-classhelper must wrap a single classhelp link");
        }
        const link = links.item(0);

        if (!link.dataset.helpurl) {
            throw new Error("roundup-classhelper link must have a data-helpurl attribute");
        }

        if (!link.dataset.width) {
            throw new Error("roundup-classhelper link must have a data-width attribute");
        }

        if (!link.dataset.height) {
            throw new Error("roundup-classhelper link must have a data-height attribute");
        }

        if (!link.getAttribute("onclick")) {
            throw new Error("roundup-classhelper link should have an onclick attribute set");
        }

        return link;
    }

    /**
     * This method parses the helpurl link to get the necessary data for the classhelper.
     * @param {HTMLAnchorElement} link
     * @returns {HelpUrlProps}
     * @throws {Error} when the helpurl link is not proper
     */
    static parseHelpUrlProps(link) {
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
            throw new Error("invalid helpurl from link, missing query params");
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
            fields
        }
    }

    /** 
     * from roundup docs rest api url - "{host}/{tracker}
     * we pass helpurl which is parsed from anchor tag and return a URL.
     * @param {HelpUrlProps} props
     * @returns {URL}
     */
    static getRestURL(trackerBaseURL, props) {
        const restDataPath = "rest/data";
        const base = trackerBaseURL + "/" + restDataPath + "/" + props.apiClassName;
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

    static getSearchURL(trackerBaseURL, props, formData) {
        const url = new URL(ClassHelper.getRestURL(trackerBaseURL, props).toString());
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
        form.classList.add("popup-search"); // Add class for styling

        const params = this.getAttribute("searchWith").split(',');

        const table = document.createElement("table");
        table.classList.add("search-table"); // Add class for styling

        for (var param of params) {
            param = param.split("[]")[0];

            const row = document.createElement("tr");
            const labelCell = document.createElement("td");
            const inputCell = document.createElement("td");

            const label = document.createElement("label");
            label.classList.add("search-label"); // Add class for styling
            label.setAttribute("for", param);
            label.textContent = param + ":";

            let input;
            if (this.dropdowns[param]) {
                input = document.createElement("select");

                let nullOption = document.createElement("option");
                nullOption.value = "";
                nullOption.textContent = "---";
                input.appendChild(nullOption);

                for (let key of this.dropdowns[param].keys()) {
                    let option = document.createElement("option");
                    option.value = key;
                    option.textContent = this.dropdowns[param].get(key);
                    input.appendChild(option);
                }
            } else {
                input = document.createElement("input");
                input.setAttribute("type", "text");
            }

            input.setAttribute("name", param);
            input.setAttribute("id", param);
            input.classList.add("search-input"); // Add class for styling   

            labelCell.appendChild(label);
            inputCell.appendChild(input);

            row.appendChild(labelCell);
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
            let fd = new FormData(form);
            this.dispatchEvent(new CustomEvent("search", {
                detail: {
                    value: fd
                }
            }));
        });

        buttonCell.appendChild(search);
        buttonCell.appendChild(reset);
        buttonRow.appendChild(emptyButtonCell);
        buttonRow.appendChild(buttonCell);

        table.appendChild(buttonRow);

        form.appendChild(table);
        fragment.appendChild(form);

        return fragment;
    }

    getPaginationFragment(prevUrl, nextUrl, index, size) {
        const fragment = document.createDocumentFragment();

        const container = document.createElement("div");
        container.id = "popup-pagination";
        container.classList.add("popup-pagination");

        const info = document.createElement('span');
        info.textContent = `${1 + (parseInt(index) - 1) * parseInt(size)}..${parseInt(index) * parseInt(size)}`;

        const prev = document.createElement("button");
        prev.innerHTML = ClassHelper.translations["Prev"];
        prev.setAttribute("disabled", "disabled");
        if (prevUrl) {
            prev.removeAttribute("disabled");
            prev.addEventListener("click", () => {
                this.dispatchEvent(new CustomEvent("prevPage", {
                    detail: {
                        value: prevUrl
                    }
                }));
            });
        }

        const next = document.createElement("button");
        next.innerHTML = ClassHelper.translations["Next"];
        next.setAttribute("disabled", "disabled");
        if (nextUrl) {
            next.removeAttribute("disabled");
            next.addEventListener("click", () => {
                this.dispatchEvent(new CustomEvent("nextPage", {
                    detail: {
                        value: nextUrl
                    }
                }));
            });
        }

        container.append(prev, info, next);
        fragment.appendChild(container);
        return fragment;
    }

    getAccumulatorFragment(preSelectedValues) {
        const fragment = document.createDocumentFragment();
        const container = document.createElement("div");
        container.id = "popup-control";
        container.setAttribute("class", "popup-control");

        const preview = document.createElement("input");
        preview.id = "popup-preview";
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

        container.append(preview, cancel, apply);
        fragment.appendChild(container);

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

        const container = document.createElement('div');
        container.id = "popup-tablediv";
        container.classList.add("popup-tablediv");

        const table = document.createElement('table');
        table.classList.add("popup-table");
        const thead = document.createElement('thead');
        const tbody = document.createElement('tbody');
        const tfoot = document.createElement('tfoot');

        // Create table headers
        const headerRow = document.createElement('tr');
        let thx = document.createElement("th");
        thx.textContent = "X";
        thx.setAttribute("class", "tableheader");
        headerRow.appendChild(thx);

        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);

        // Create table body with data
        data.forEach((entry) => {
            const row = document.createElement('tr');
            row.dataset.id = entry[headers[0]];
            row.setAttribute("tabindex", 1);

            const checkbox = document.createElement("input");
            checkbox.setAttribute("type", "checkbox");
            checkbox.checked = false;
            checkbox.setAttribute("tabindex", -1);

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
            tbody.appendChild(row);
        });

        tbody.addEventListener("click", (e) => {
            let id, tr;
            if (e.target.tagName === "INPUT" || e.target.tagName === "TD") {
                id = e.target.parentElement.dataset.id;
                tr = e.target.parentElement;
            } else if (e.target.tagName === "TR") {
                id = e.target.dataset.id;
                tr = e.target;
            }

            if (e.target.tagName !== "INPUT") {
                tr.children.item(0).checked = !tr.children.item(0).checked;
            }

            this.dispatchEvent(new CustomEvent("selection", {
                detail: {
                    value: id
                }
            }));
        });

        this.popupRef.document.addEventListener("keydown", (e) => {
            if (e.target.tagName == "TR") {
                if (e.key === "ArrowDown") {
                    if (e.target.nextElementSibling != null) {
                        e.target.nextElementSibling.focus();
                    } else {
                        e.target.parentElement.firstChild.focus();
                    }
                }
                if (e.key === "ArrowUp") {
                    if (e.target.previousElementSibling != null) {
                        e.target.previousElementSibling.focus();
                    } else {
                        e.target.parentElement.lastChild.focus();
                    }
                }
                if (e.key === "Enter" || e.key === " ") {
                    let tr = e.target;
                    tr.children.item(0).checked = !tr.children.item(0).checked;
                    this.dispatchEvent(new CustomEvent("selection", {
                        detail: {
                            value: tr.dataset.id
                        }
                    }));
                }
            }
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

        // Assemble the table
        table.appendChild(thead);
        table.appendChild(tbody);
        table.appendChild(tfoot); // Append the footer

        container.appendChild(table);

        fragment.appendChild(container);

        return fragment;
    }

    /**
     * main method called when classhelper is clicked
     * @param {URL | string} apiURL
     * @param {HelpUrlProps} props 
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
        css.href = this.trackerBaseURL + '/' + CSS_FILE_NAME;
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
     * @param {HelpUrlProps} props
     * @throws {Error} when fetching or parsing data from roundup rest api fails
     */
    async pageChange(apiURL, props) {
        let accumulatorValues = this.popupRef.document.getElementById("popup-preview").value.split(",");

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

        const popupDocument = this.popupRef.document;
        const popupBody = this.popupRef.document.body;
        props.pageIndex = selfPageURL.searchParams.get("@page_index");

        const oldPaginationFrag = popupDocument.getElementById("popup-pagination");
        const newPaginationFrag = this.getPaginationFragment(prevPageURL, nextPageURL, props.pageIndex, props.pageSize);
        popupBody.replaceChild(newPaginationFrag, oldPaginationFrag);

        let oldTableFrag = popupDocument.getElementById("popup-tablediv");
        let newTableFrag = this.getTableFragment(props.fields, data.collection, accumulatorValues);
        popupBody.replaceChild(newTableFrag, oldTableFrag);
    }

    /** method when a value is selected in 
     * @param {HelpUrlProps} props
     * @param {string} value
     */
    valueSelected(props, value) {
        const input = document.getElementsByName(props.formProperty).item(0);
        input.value = value;
        this.popupRef.close();
    }

    /** method when search is performed within classhelper, here we need to update the classhelper table with search results
     * @param {URL | string} apiURL
     * @param {HelpUrlProps} props
     * @throws {Error} when fetching or parsing data from roundup rest api fails
     */
    async searchEvent(apiURL, props) {
        let accumulatorValues = this.popupRef.document.getElementById("popup-preview").value.split(",");

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

        const popupDocument = this.popupRef.document;
        const popupBody = this.popupRef.document.body;
        props.pageIndex = selfPageURL.searchParams.get("@page_index");

        const oldPaginationFrag = popupDocument.getElementById("popup-pagination");
        let newPaginationFrag;
        if (prevPageURL || nextPageURL) {
            newPaginationFrag = this.getPaginationFragment(prevPageURL, nextPageURL, props.pageIndex, props.pageSize);
        } else {
            newPaginationFrag = popupDocument.createElement("div");
            newPaginationFrag.id = "popup-pagination";
            newPaginationFrag.classList.add("popup-pagination");
        }
        popupBody.replaceChild(newPaginationFrag, oldPaginationFrag);


        let oldTableFrag = popupDocument.getElementById("popup-tablediv");
        let newTableFrag = this.getTableFragment(props.fields, data.collection, accumulatorValues);
        popupBody.replaceChild(newTableFrag, oldTableFrag);
    }

    /** method when an entry in classhelper table is selected
     * @param {string} value
     */
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

    customElements.define(CLASSHELPER_TAG_NAME, ClassHelper);
}

enableClassHelper();