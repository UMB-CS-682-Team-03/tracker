# Clone mercurial repository.
hg clone http://hg.code.sf.net/p/roundup/code roundup

# Navigate to roundup, then git clone tracker only repo.
cd roundup
git clone https://github.com/UMB-CS-682-Team-03/tracker.git

# Init the demo tracker
python3 demo.py -b sqlite

# Move the files from tracker dir to demo dir
cp -r ./tracker/**/* ./demo
cp -r ./tracker/.git ./tracker/.gitignore ./demo

# Delete the tracker dir
rm -rf ./tracker

# Now you are setup open the roundup folder in VScode.
# Any new changes are only to be done in demo dir
# git is initialised to track origin in demo dir

#  Roundup - Classhelper
##  `<roundup-classhelper>`
## Why there is need of `<roundup-classhelper>` in the issue tracker?
* The existing ClassHelper implementation in Roundup Issue Tracker uses outdated HTML framesets, which have accessibility limitations, lack advanced features like search and sorting, are difficult to customize, and harder to maintain with modern web development practices.
* The `<roundup-classhelper>`, which is a web component, addresses these shortcomings by providing a modern, accessible, and flexible solution implemented as a web component. It offers improved accessibility, an enhanced user experience with advanced features, easy customization, better maintainability, and a fallback mechanism for browsers that don't support web components.
* Overall, the `<roundup-classhelper>` modernizes and enhances the ClassHelper feature, making it more accessible, user-friendly, and maintainable, while laying the foundation for further improvements and integration with other Roundup features.

## What is classhelper comprised of?
There are three main parts of the roundup-classhelper component:

* **Search Section (optional)**: This section allows users to search for items based on specified fields. For example, users can search for issues by title, status, or keywords. The search section is optional and may not be present in some configurations.
   <img src="/roundup/demo/doc-assets/image-1.png" alt="Image Title" width="60%">

* **Select/Info Table Section**: This section displays the search results or a list of available items. If a search section is present, it will show the items matching the search criteria. If no search section is available, it will display all available items. This section may include pagination controls to navigate through large datasets. Additionally, it may have a checkbox for selecting items if the `<roundup-classhelper>` is associated with a form field. However, if there is no associated form field (i.e., "info mode"), this section will act as an information box without selection capabilities.

   <img src="/roundup/demo/doc-assets/image-3.png" alt="Image Title" width="60%">

* **Accumulator/Submit Section**: This section shows the items selected by the user from the Select/Info Table Section. It serves as an accumulator, allowing users to review and confirm their selections before submitting or updating the associated form field. If the `<roundup-classhelper>` is in "info mode" (without an associated form field), this section may be absent, as there are no items to accumulate or submit.
   <img src="/roundup/demo/doc-assets/image-4.png" alt="Image Title" width="60%">

The presence and behavior of these sections can vary depending on the configuration and intended use case of the `<roundup-classhelper>` component. For example, in some scenarios, the Search Section may not be necessary.

## How can you use it?
### Keyboard Usage
The `<roundup-classhelper>` is designed to be fully accessible and navigable using only the keyboard. The tab order and key bindings are as follows:
* **Tab Order**: Users can navigate between the different sections (Search, Select/Info Table, Accumulator/Submit) using the Tab key. The order of focus will be determined by the DOM structure of the component.

* **Search Section**: If present, users can type their search query directly into the search input field using the keyboard.

* **Select/Info Table Section**:
   * Users can navigate through the list of items using the Up and Down arrow keys.
   * To select/deselect an item, users can press the Space key when an item is focused.
   * If pagination controls are present, users can navigate to the next or previous page using the appropriate links or buttons, which should be accessible via the Tab key.



### Mouse Usage
In addition to keyboard navigation, the `<roundup-classhelper>` component can be used with a mouse or other pointing device:

* **Search Section**: Users can click inside the search input field and type their query.


* **Select/Info Table Section**:

   * Users can click on a table row to select/deselect an item.
   * If pagination controls are present, users can click on the appropriate links or buttons to navigate to the next or previous page.

* **Accumulator/Submit Section**:

   * If present, users can click on the submit button or any other controls in this section to trigger the submission or update action.

### Admin guide for deploying roundup-classhelper to an existing tracker
#### Which tag to use and where to place it.
 * To customise your own classhelper you can introduce of the `<roundup-classhelper>` web component.

 * Locate the appropriate template files (e.g., issue.html) where you want to use the <roundup-classhelper>.
 
 * Wrap the existing ClassHelper link with the <roundup-classhelper> tag.
##### Before the code would look like this.
```html
<th i18n:translate="">Nosy List</th>
 <td>
  <span tal:replace="structure context/nosy/field" />
    <span tal:condition="context/is_edit_ok" tal:replace="structure
    python:db.user.classhelp('username,realname,address', property='nosy', width='600')" />    
<br>
 </td>
  ```

##### After adding the `<roundup-classhelper>`, it should look like this.
```html
<th i18n:translate="">Nosy List</th>
 <td>
  <span tal:replace="structure context/nosy/field" />
  <roundup-classhelper searchWith="username,phone,roles[]">
    <span tal:condition="context/is_edit_ok" tal:replace="structure
    python:db.user.classhelp('username,realname,address', property='nosy', width='600')" />    
  </roundup-classhelper>
<br>
 </td>
  ```

  #### Setting Attributes
  * Set the `searchWith` attribute to specify the fields that can be used for searching (e.g., `searchWith="title,status,keyword"`).

  * Optionally, customize the search parameters using the following syntax:
      * `"status[]"`: Displays a dropdown for the "status" field, showing all possible values. 
         ```html
         <roundup-classhelper searchWith="title,status[],    keyword[]">
            <span tal:condition="context/is_edit_ok" tal:replace="structure python:db.issue.classhelp('id,title', property='superseder', pagesize=100)" />
         </roundup-classhelper>
         ```
      * `"keyword[]+name"`: Sorts the "keyword" dropdown in ascending order by name.
         ```html
         <roundup-classhelper searchWith="title,status[],keyword[]+name">
            <span tal:condition="context/is_edit_ok" tal:replace="structure python:db.issue.classhelp('id,title', property='superseder', pagesize=100)" />
         </roundup-classhelper>
         ```
      * `"keyword[]-name"`: Sorts the "keyword" dropdown in descending order by name.
         ```html
         <roundup-classhelper searchWith="title,status[],keyword[]-name">
            <span tal:condition="context/is_edit_ok" tal:replace="structure python:db.issue.classhelp('id,title', property='superseder', pagesize=100)" />
         </roundup-classhelper>
         ```
   * If the `roles` field cannot be displayed as a dropdown, it will be treated as a text-only match.
   
   #### User ClassHelper
   * To emulate the normal user ClassHelper behavior (e.g., for username and roles), use the following attribute values:
      ``` html
      <roundup-classhelper searchWith="username,roles[]">
         <!-- ClassHelper content -->
      </roundup-classhelper>
      ```
   
   #### Fallback Mechanism
   If the user's browser doesn't support web components, the `<roundup-classhelper>` will automatically fall back to the existing ClassHelper link.

   <img src="/roundup/demo/doc-assets/image-5.png" alt="Image Title" width="40%">

   #### Error Handling
   * In case of errors, the component will display relevant messages to the user.(component will notify the user)
   * For further debugging, users can open the browser console and inspect the results.

   # Roles - Interfaces.py

   #### Refreshing `classhelper.css`
   In case of issues with the `<roundup-classhelper>` component, you can try refreshing the classhelper.css file by following these steps:
   * Open the `<roundup-classhelper>` popup window.
   * Press `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac) to perform a hard refresh of the page.

   This will force the browser to reload the classhelper.js file and any other associated resources, potentially resolving any issues caused by cached or outdated files.




# Running the Test Suite
```
# Requirements
- Selenium WebDriver
- GeckoDriver (for Firefox)
- Splinter (for browser automation)

# Installation Instructions
1. **Selenium and Splinter Installation**: Open your terminal or command prompt and run:
   python -m pip install splinter==0.eeeeeeeeeeeeeeee21.0
   python -m pip install selenium==4.18.1

2. ** GeckoDriver Installation**: 
	pip install geckodriver==0.0.1

# Run the test_suite

python test_classhelper.py
```