const TRANSLATIONS = {
    apply: "Apply",
    cancel: "Cancel",
    next: "next",
    previous: "previous",
    search: "Search",
    reset: "Reset"
}

class ClassHelper extends HTMLElement {
    /** @type {Window} */
    popupRef = null;

    connectedCallback() {
        let links = this.querySelectorAll("a");
        if (links.length != 1) {
            throw new Error("roundup-classhelper must wrap a single classhelp link");
        }
        let link = links.item(0);
        link.onclick = null;

        const linkProp = ClassHelper.parseLink(link);
        const apiURL = ClassHelper.getRestURL(linkProp);

        // Listeners
        link.addEventListener("click", (event) => {
            event.preventDefault();
            this.openPopUp(apiURL, linkProp);
        });
        this.addEventListener("nextPage", (event) => {
            this.pageChange(event.detail.url, linkProp);
        });
        this.addEventListener("prevPage", (event) => {
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

    // getSearchFragment() {
    //     const fragment = document.createDocumentFragment();
        
    //     const divsearch = document.createElement("div");
    //     divsearch.setAttribute("id", "popup-divsearch");
        
    //     const form = document.createElement("form");
    //     form.setAttribute("id", "popup-search");

    //     const params = this.getAttribute("searchWith").split(',');

    //     const table = document.createElement("table");

    //     for (var param of params) {
    //         const row = document.createElement("tr");
    //         const labelCell = document.createElement("td");
    //         const inputCell = document.createElement("td");

    //         const label = document.createElement("label");
    //         label.textContent = param + ":";
    //         label.setAttribute("for", param);
    //         label.style.textTransform = "capitalize";

    //         if (param === "username" || param === "phone" || param === "roles") {
    //             label.style.fontWeight = "bold";
    //         }

    //         const input = document.createElement("input");
    //         input.setAttribute("name", param);
    //         input.setAttribute("id", param);

    //         labelCell.appendChild(label);
    //         row.appendChild(labelCell);

    //         inputCell.appendChild(input);
    //         row.appendChild(inputCell);

    //         const rowWrapper = document.createElement("div");
    //         rowWrapper.style.display = "flex";
    //         rowWrapper.style.flexDirection = "row";
    //          rowWrapper.style.justifyContent = "flex-end"; 
    //         // rowWrapper.style.alignItems = "center";
    //         rowWrapper.appendChild(row);


    //         table.appendChild(rowWrapper);
    //     }

    //     // Add an empty row
    //     const emptyRow = document.createElement("tr");
    //     const emptyCell = document.createElement("td");
    //     emptyRow.appendChild(emptyCell);
    //     table.appendChild(emptyRow);

    //     // Add search and reset buttons
    //     const buttonRow = document.createElement("tr");
    //     const buttonCell = document.createElement("td");
    //     buttonCell.colSpan = 2;

    //     const search = document.createElement("button");
    //     search.textContent = TRANSLATIONS.search;
    //     search.addEventListener("click", (e) => {
    //         e.preventDefault();
    //         let fd = new FormData(form);
    //         this.dispatchEvent(new CustomEvent("search", {
    //             detail: {
    //                 data: fd
    //             }
    //         }));
    //     });

    //     const reset = document.createElement("button");
    //     reset.textContent = TRANSLATIONS.reset;
    //     reset.addEventListener("click", (e) => {
    //         e.preventDefault();
    //         form.reset();
    //     });

    //     const style = document.createElement("style");
    //     style.textContent = `
    //         #popup-search {
    //         position: fixed;
    //         overflow: hidden;
    //         top: 0;
    //         left: 0;
    //         width: 100%;
    //         background-color: #fff; /* Optional: Adjust background color as needed */
    //         // padding: 10px; /* Optional: Adjust padding as needed */
    //         border-bottom: 2px solid #444;
    //     }
    //     `;
    //     buttonCell.appendChild(search);
    //     buttonCell.appendChild(reset);
    //     buttonRow.appendChild(buttonCell);
    //     const buttonRowWrapper = document.createElement("div");
    // buttonRowWrapper.style.display = "flex";
    // buttonRowWrapper.style.flexDirection = "row";
    // buttonRowWrapper.appendChild(buttonRow);
    // table.appendChild(buttonRowWrapper);

    //     //table.appendChild(buttonRow);

    //     form.appendChild(table);
    //     form.appendChild(style);

    //     divsearch.appendChild(form);
    //     fragment.appendChild(divsearch);

    //     return fragment;
//}
    // getSearchFragment() {
    //     const fragment = document.createDocumentFragment();
        
    //     const divsearch = document.createElement("div");
    //     divsearch.setAttribute("id", "popup-divsearch");
        
    //     const form = document.createElement("form");
    //     form.setAttribute("id", "popup-search");
    
    //     const params = this.getAttribute("searchWith").split(',');
    
    //     const table = document.createElement("table");
    
    //     for (var param of params) {
    //         const row = document.createElement("tr");
    //         const labelCell = document.createElement("td");
    //         const inputCell = document.createElement("td");
    
    //         const label = document.createElement("label");
    //         label.textContent = param + ":";
    //         label.setAttribute("for", param);
    //         label.style.textTransform = "capitalize";
    
    //         if (param === "username" || param === "phone" || param === "roles") {
    //             label.style.fontWeight = "bold";
    //         }
    
    //         const input = document.createElement("input");
    //         input.setAttribute("name", param);
    //         input.setAttribute("id", param);
    
    //         labelCell.appendChild(label);
    //         row.appendChild(labelCell);
    
    //         inputCell.appendChild(input);
    //         row.appendChild(inputCell);
    
    //         // Wrap the row in a div with flexbox and justify content as flex-end
    //         const rowWrapper = document.createElement("div");
    //         rowWrapper.style.display = "flex";
    //         rowWrapper.style.flexDirection = "row";
    //         rowWrapper.style.justifyContent = "flex-end"; 
    //         rowWrapper.appendChild(row);
    
    //         // Append the wrapped row to the table
    //         table.appendChild(rowWrapper);
    //     }
    
    //     // Add an empty row
    //     const emptyRow = document.createElement("tr");
    //     const emptyCell = document.createElement("td");
    //     emptyRow.appendChild(emptyCell);
    //     const emptyRowWrapper = document.createElement("div");
    //     emptyRowWrapper.style.display = "flex";
    //     emptyRowWrapper.style.flexDirection = "row";
    //     emptyRowWrapper.appendChild(emptyRow);
    //     table.appendChild(emptyRowWrapper);
    
    //     // Add search and reset buttons
    //     const buttonRow = document.createElement("tr");
    //     const buttonCell = document.createElement("td");
    //     buttonCell.colSpan = 2;
    
    //     const search = document.createElement("button");
    //     search.textContent = TRANSLATIONS.search;
    //     search.addEventListener("click", (e) => {
    //         e.preventDefault();
    //         let fd = new FormData(form);
    //         this.dispatchEvent(new CustomEvent("search", {
    //             detail: {
    //                 data: fd
    //             }
    //         }));
    //     });
    
    //     const reset = document.createElement("button");
    //     reset.textContent = TRANSLATIONS.reset;
    //     reset.style.marginLeft = "67px";
    //     reset.addEventListener("click", (e) => {
    //         e.preventDefault();
    //         form.reset();
    //     });
    
    //     const style = document.createElement("style");
    //     style.textContent = `
    //         #popup-search {
    //         position: fixed;
    //         overflow: hidden;
    //         top: 0;
    //         left: 0;
    //         width: 100%;
    //         background-color: #fff; /* Optional: Adjust background color as needed */
    //         // padding: 10px; /* Optional: Adjust padding as needed */
    //         border-bottom: 2px solid #444;
    //     }
    //     `;
    
    //     buttonCell.appendChild(search);
    //     buttonCell.appendChild(reset);
    //     buttonRow.appendChild(buttonCell);
    //     const buttonRowWrapper = document.createElement("div");
    //     buttonRowWrapper.style.display = "flex";
    //     buttonRowWrapper.style.flexDirection = "row";
    //     buttonRowWrapper.style.justifyContent = "flex-end"; // Align buttons to the right side
    //     buttonRowWrapper.appendChild(buttonRow);
    //     table.appendChild(buttonRowWrapper);
    
    //     form.appendChild(table);
    //     form.appendChild(style);
    
    //     divsearch.appendChild(form);
    //     fragment.appendChild(divsearch);
    
    //     return fragment;
    // }

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
            label.textContent = param + ":";
            label.setAttribute("for", param);
            label.classList.add("search-label"); // Add class for styling
            label.style.textTransform = "capitalize"; // Apply text transformation
    
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
        search.textContent = TRANSLATIONS.search;
        search.style.marginLeft = "75px";
        search.classList.add("search-button"); // Add class for styling
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
        reset.textContent = TRANSLATIONS.reset;
        reset.style.marginLeft = "70px";
        reset.classList.add("reset-button"); // Add class for styling
        reset.addEventListener("click", (e) => {
            e.preventDefault();
            form.reset();
        });
    
        const style = document.createElement("style");
        style.textContent = `
            .popup-search {
                position: fixed;
                overflow: hidden;
                top: 0;
                left: 0;
                width: 100%;
                background-color: #fff; /* Optional: Adjust background color as needed */
                // padding: 10px; /* Optional: Adjust padding as needed */
                border-bottom: 2px solid #444;
            }
            /* Add more CSS rules for other classes as needed */
        `;
        form.appendChild(style);
    
        buttonCell.appendChild(search);
        buttonCell.appendChild(reset);
        buttonRow.appendChild(buttonCell);
        table.appendChild(buttonRow);
    
        form.appendChild(table);
        divsearch.appendChild(form);
        fragment.appendChild(divsearch);
    
        return fragment;
    }
    

    getPaginationFragment(prevUrl, nextUrl, index, size) {
        const fragment = document.createDocumentFragment();
        
        const divtable = document.createElement('divtable');
        divtable.setAttribute("id", "popup-divtable");
        
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
            a.textContent = "<<" + TRANSLATIONS.previous;
            prev.appendChild(a);
        }
        const info = document.createElement('td');
        info.textContent = `${1 + (parseInt(index) - 1) * parseInt(size)}..${parseInt(index) * parseInt(size)}`;
        const next = document.createElement('td');
        if (nextUrl) {
            const a = document.createElement('button');
            a.setAttribute("id", "button-pagination");
            a.addEventListener("click", () => {
                this.dispatchEvent(new CustomEvent("nextPage", {
                    detail: {
                        url: nextUrl
                    }
                }));
            });
            a.textContent = TRANSLATIONS.next + ">>";
            next.appendChild(a);
        }

        const style = document.createElement("style");
        style.textContent = `
        #popup-pagination:hover {
            background-color: transparent;
        }      
        #popup-pagination th {
                width: 33%;
                border-style: hidden;
                text-align: center;
              }
              #popup-pagination td {
                  border: none
              }
              #popup-pagination th:first-child {
                text-align: left;
              }
              #popup-pagination th:last-child {
                text-align: right;
              }

              /* Anchor tag styles */
    #popup-pagination button, #popup-pagination a:link {
        color: blue;
        text-decoration: none;
    }

    /* Define anchor tag styles on hover */
    #popup-pagination button:hover {
        background-color: transparent;
        cursor: pointer;
    }
        `;


        tr.append(prev, info, next);
        table.appendChild(tr);
        table.appendChild(style);   //In a single file(using)

        divtable.appendChild(table);

        fragment.appendChild(divtable);
        return fragment;
    }

    getAccumulatorFragment() {
        const fragment = document.createDocumentFragment();
        const divacc = document.createElement("div");
        divacc.setAttribute("id", "popup-control");

        const preview = document.createElement("input");
        preview.setAttribute("id", "popup-preview");
        preview.type = "text";
        preview.name = "preview";

        const cancel = document.createElement("button");
        cancel.textContent = TRANSLATIONS.cancel;
        cancel.addEventListener("click", () => {
            preview.value = "";
        })

        const apply = document.createElement("button");
        apply.setAttribute("id", "acc-apply");
        apply.textContent = TRANSLATIONS.apply;
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
          }
          
          #acc-apply{
            font-weight: bold;
          }`;

          divacc.append(preview, cancel, apply, style);

        //fragment.appendChild(div, style);
        fragment.appendChild(divacc);

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

        const divtable = document.createElement('div');
        divtable.setAttribute("id", "popup-divtable");

        const table = document.createElement('table');
        table.setAttribute("id", "popup-table");
        const thead = document.createElement('thead');
        const tbody = document.createElement('tbody');
        const tfoot = document.createElement('tfoot'); // Create table footer

        // Create table headers
        const headerRow = document.createElement('tr');
        let thx = document.createElement("th");
        thx.textContent = "X";
        thx.style.width = "15px";
        headerRow.appendChild(thx);

        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            if (header === "ID") {
                th.setAttribute("id", "tableid"); // Set width for ID column
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

        const style = document.createElement("style");
        style.textContent = `
        #popup-divtable {
            max-height: 350px; /* Adjust the maximum height as needed */
            overflow-y: auto; /* Enable vertical scrolling */
        }    
        
        #check, #tableid{
            width: 10px;
        }

        #popup-table {
                //  position: absolute;
                // // margin-top: 90px;
                // table-layout: fixed;
                // overflow: scroll;
                // font-size: .9em;
                // padding-bottom: 3em;

                table-layout: fixed; /* compromises quality for speed   */
                //overflow: hidden;
                //overflow-y: auto; /* Enable vertical scrolling */
                max-height: 100px;
                width: 100%;
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
                cursor: pointer;
            }
            
        `;

        // Assemble the table
        table.appendChild(thead);
        table.appendChild(tbody);
        table.appendChild(tfoot); // Append the footer
        table.appendChild(style);

        divtable.appendChild(table);

        fragment.appendChild(divtable);

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

            // const b = this.popupRef.document.body;
            // const tableFragment = this.getTableFragment(props.fields, data.collection);

            // if (this.getAttribute("searchWith")) {
            //     b.appendChild(this.getSearchFragment());
            //     tableFragment.style.marginTop = "20px";
            // }
            // b.appendChild(this.getPaginationFragment(prevURL, nextURL, props.pageIndex, props.pageSize));
            // b.appendChild(tableFragment);
            // b.appendChild(this.getAccumulatorFragment());

        //     const b = this.popupRef.document.body;
        // if (this.getAttribute("searchWith")) {
        //     b.appendChild(this.getSearchFragment());
        // }
        // b.appendChild(this.getPaginationFragment(prevURL, nextURL, props.pageIndex, props.pageSize));

        // // Conditionally add table fragment with or without top margin
        // const tableFragment = this.getTableFragment(props.fields, data.collection);
        // if (this.getAttribute("searchWith")) {
        //     b.appendChild(tableFragment);
        // } else {
        //     const styledTableFragment = document.createElement("div");
        //     styledTableFragment.style.marginTop = "0px";
        //     styledTableFragment.appendChild(tableFragment);
        //     b.appendChild(styledTableFragment);
        // }

        // b.appendChild(this.getAccumulatorFragment());
        
        
        
        
        
        // const b = this.popupRef.document.body;
        // if (this.getAttribute("searchWith")) {
        //     b.appendChild(this.getSearchFragment());
        // }
        // b.appendChild(this.getPaginationFragment(prevURL, nextURL, props.pageIndex, props.pageSize));

        // // Conditionally add styled table fragment with or without top margin
        // const tableFragment = this.getTableFragment(props.fields, data.collection);
        // const styledTableFragment = document.createElement("div");
        // styledTableFragment.style.marginTop = "0px";
        // styledTableFragment.style.position = "relative"; // Ensures fragment remains beneath search fragment

        // if (this.getAttribute("searchWith")) {
        //     styledTableFragment.appendChild(tableFragment);
        //     b.appendChild(styledTableFragment);
        // } else {
        //     b.appendChild(styledTableFragment);
        //     styledTableFragment.appendChild(tableFragment);
        // }

        // // Apply opacity to search fragment on scroll
        // const searchFragment = b.querySelector("[data-component='search-fragment']");
        // if (searchFragment) {
        //     b.addEventListener("scroll", () => {
        //         const scrollTop = b.scrollTop;
        //         const searchFragmentHeight = searchFragment.offsetHeight;
        //         const opacity = Math.min(1, scrollTop / searchFragmentHeight);
        //         searchFragment.style.opacity = opacity;
        //     });
        // }

        // b.appendChild(this.getAccumulatorFragment());

        // const container = document.createElement("div");
        // container.setAttribute("id", "container");
        // const style = document.createElement("style");
        // style.textContent = `
        //     #container {
        //     display: flex;
        //     flex-direction: column;
        //     justify-content: space-around;
        //     alignItems: center;
        // }
        // `;
        // container.appendChild(style);

        const container = document.createElement("div");
        container.style.display = "flex";
        container.style.flexDirection = "column";
        container.style.justifyContent = "space-around";
        //container.style.alignItems = "center";

        const b = this.popupRef.document.body;
        if (this.getAttribute("searchWith")) {
            container.appendChild(this.getSearchFragment());
            //b.appendChild(this.getSearchFragment());
        }
        container.appendChild(this.getPaginationFragment(prevURL, nextURL, props.pageIndex, props.pageSize));
        //b.appendChild(this.getPaginationFragment(prevURL, nextURL, props.pageIndex, props.pageSize));

        // Conditionally add table fragment with or without top margin
        const tableFragment = this.getTableFragment(props.fields, data.collection);
        if (this.getAttribute("searchWith")) {
            const styledTableFragment = document.createElement("div");
            styledTableFragment.style.marginTop = "95px";
            styledTableFragment.appendChild(tableFragment);
            container.appendChild(styledTableFragment);
            //b.appendChild(styledTableFragment);
        } else {
            const styledTableFragment = document.createElement("div");
            //styledTableFragment.style.marginTop = "0px";
            styledTableFragment.appendChild(tableFragment);
            container.appendChild(styledTableFragment);
            //b.appendChild(styledTableFragment);
        }
        container.appendChild(this.getAccumulatorFragment());
        // container.appendChild(style);
        
        //b.appendChild(this.getAccumulatorFragment());
        b.appendChild(container);
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
            let selfUrl = new URL(data["@links"].self[0].uri);
            props.pageIndex = selfUrl.searchParams.get("@page_index");

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