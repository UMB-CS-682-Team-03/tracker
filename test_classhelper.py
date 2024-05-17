
import time
import unittest
from selenium.webdriver.common.keys import Keys
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from random import randint

HEADLESS = False
TRACKER_URL = "http://localhost:8080/demo/"

class TestKeywords(unittest.TestCase):
    def setUp(self):
        options = webdriver.FirefoxOptions()
        if HEADLESS:
            options.add_argument('--headless')

        self.driver = webdriver.Firefox(options=options)

        wait = WebDriverWait(self.driver, 10)

        self.driver.get(TRACKER_URL)
        self.driver.set_window_size(786, 824)
        
        # perform admin login
        wait.until(EC.element_to_be_clickable((By.NAME, "__login_name"))).click()
        self.driver.find_element(By.NAME, "__login_name").send_keys("admin")
        self.driver.find_element(By.NAME, "__login_password").send_keys("admin")
        self.driver.find_element(By.CSS_SELECTOR, '.userblock input[type="submit"]').click()
        
        # check if a keyword "test" exists? if not create new keyword test for testing purpose
        keyword = "test"
        wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, 'a[href="keyword?@template=item"]'))).click()
        input = wait.until(EC.element_to_be_clickable((By.NAME, "name")))
        
        keyword_exists = len(self.driver.find_elements(By.LINK_TEXT, keyword)) > 0
        if(not keyword_exists):
            input.send_keys(keyword)
            self.driver.find_element(By.NAME, "submit_button").click()

    def tearDown(self):
        # Close the browser
        self.driver.quit()

    def test_demo1(self):
        wait = WebDriverWait(self.driver, 10)
        actions = ActionChains(self.driver)

        # Click on element with link text 'Create New'
        wait.until(EC.element_to_be_clickable((By.LINK_TEXT, "Create New"))).click()

        time.sleep(1)
        # Wait until the popup is loaded and click on the help link
        wait.until(
            EC.presence_of_element_located((By.CSS_SELECTOR, 'input[name="keyword"] + roundup-classhelper'))
        ).click()

        # Switch to the new window
        handles = self.driver.window_handles
        self.driver.switch_to.window(handles[-1])

        # Click on another elements in the new window
        rows = self.driver.find_elements(By.CSS_SELECTOR, ".row-style")
        
        selected_keywords = []
                
        for row in rows:
            row.find_element(By.TAG_NAME, "input").click()
            selected_keywords.append(row.get_attribute("data-id"))
            
        # unselect row
        random_number = randint(0, len(rows) - 1)
        rows[random_number].find_element(By.TAG_NAME, "input").click()
        selected_keywords.remove(rows[random_number].get_attribute("data-id"))

        preview_values = self.driver.find_element(By.ID, "popup-preview").get_attribute("value")
        
        self.assertEqual(preview_values, ",".join(selected_keywords))    

        self.driver.find_element(By.CSS_SELECTOR, ".popup-apply").click()
        time.sleep(1)

        # Switch back to the main window
        self.driver.switch_to.window(handles[0])

        # Wait until the new page is loaded
        keyword_value = wait.until(
            EC.presence_of_element_located((By.NAME, 'keyword'))
        ).get_attribute("value")
        
        self.assertEqual(keyword_value, ",".join(selected_keywords))

        self.driver.find_element(By.NAME, 'keyword').click()
        time.sleep(1)
        print("TestCase 1 -- success")






class TestNosy(unittest.TestCase):
    def setUp(self):
        # Initialize the Firefox driver with headless option setting to True.
        options = webdriver.FirefoxOptions()
        if HEADLESS:
            options.add_argument('--headless')

        self.driver = webdriver.Firefox(options=options)

    def tearDown(self):
        # Close the browser
        self.driver.quit()

    def test_demo(self):
        # Open the URL
        self.driver.get(TRACKER_URL)
        
        # Enter login credentials
        self.driver.find_element(By.NAME, '__login_name').send_keys('admin')
        self.driver.find_element(By.NAME, '__login_password').send_keys('admin')
        
        # Submit the login form
        self.driver.find_element(By.CSS_SELECTOR, '.userblock > input:nth-child(12)').click()
        
        # Wait until the 'Create New' link is present and click on it
        WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.LINK_TEXT, 'Create New'))
        )
        self.driver.find_element(By.LINK_TEXT, 'Create New').click()
        
        # Wait until the popup is loaded and click on the help link
        WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, 'tr:nth-child(3) > td:nth-child(4) .classhelp'))
        )
        # 
        self.driver.find_element(By.CSS_SELECTOR, 'tr:nth-child(3) > td:nth-child(4) .classhelp').click()
        
        # Switch to the new window
        handles = self.driver.window_handles
        self.driver.switch_to.window(handles[-1])
        
        # Wait until the new window is loaded
        WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.ID, 'username'))
        )
        
        # Type 'de' in the search box
        self.driver.find_element(By.ID, 'username').send_keys('de')
        
        # Click on the search button
        self.driver.find_element(By.CSS_SELECTOR, 'button:nth-child(1)').click()
        
        # Wait until the results are loaded
        WebDriverWait(self.driver, 10).until(
            EC.presence_of_all_elements_located((By.CSS_SELECTOR, 'tbody td:nth-child(2)'))
        )
        
        # Click on the first result
        self.driver.find_element(By.CSS_SELECTOR, 'tbody td:nth-child(2)').click()
        
        # Wait until the new page is loaded
        WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, 'button:nth-child(3)'))
        )
        # time.sleep(3)

        search_button = self.driver.find_element(By.XPATH, "//button[contains(.,'Reset')]")
        search_button.click()
        # 


        self.driver.find_element(By.ID, 'username').send_keys('mi')
        
        # Click on the search button
        self.driver.find_element(By.CSS_SELECTOR, 'button:nth-child(1)').click()
        
        # Wait until the results are loaded
        WebDriverWait(self.driver, 10).until(
            EC.presence_of_all_elements_located((By.CSS_SELECTOR, 'tbody td:nth-child(2)'))
        )
        
        # Click on the first result
        self.driver.find_element(By.CSS_SELECTOR, 'tbody td:nth-child(2)').click()
        
        # Wait until the new page is loaded
        WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, 'button:nth-child(3)'))
        )

        search_button = self.driver.find_element(By.XPATH, "//button[contains(.,'Reset')]")
        search_button.click()
        # 

        search_button = self.driver.find_element(By.XPATH, "//button[contains(.,'Search')]")
        search_button.click()
        # 

        item_to_select = self.driver.find_element(By.XPATH, "//tbody/tr[3]/td[2]")
        item_to_select.click()
        #         
        # Click on the 'Apply' button
        self.driver.find_element(By.CSS_SELECTOR, 'button:nth-child(3)').click()
        
        # Switch back to the original window
        self.driver.switch_to.window(handles[0])
        # 
        # Wait until the new page is loaded
        WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.NAME, 'nosy'))
        )
        # 
        # Check the checkbox for 'nosy'
        self.driver.find_element(By.NAME, 'nosy').click()
        print("Test Case 2 -- success")






class TestNosy1(unittest.TestCase):
    def setUp(self):
        # Initialize the Firefox driver with headless option setting to True.
        options = webdriver.FirefoxOptions()
        if HEADLESS:
            options.add_argument('--headless')

        self.driver = webdriver.Firefox(options=options)

    def tearDown(self):
        # Close the browser
        self.driver.quit()

    def test_demo1(self):
        # Open the URL
        self.driver.get(TRACKER_URL)
        
        # Enter login credentials
        self.driver.find_element(By.NAME, '__login_name').send_keys('admin')
        self.driver.find_element(By.NAME, '__login_password').send_keys('admin')
        
        # Submit the login form
        self.driver.find_element(By.CSS_SELECTOR, '.userblock > input:nth-child(12)').click()
        
        # Wait until the 'Create New' link is present and click on it
        WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.LINK_TEXT, 'Create New'))
        )
        self.driver.find_element(By.LINK_TEXT, 'Create New').click()
        
        # Wait until the popup is loaded and click on the help link
        WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, 'tr:nth-child(3) > td:nth-child(4) .classhelp'))
        )
        # 
        self.driver.find_element(By.CSS_SELECTOR, 'tr:nth-child(3) > td:nth-child(4) .classhelp').click()
        
        # Switch to the new window
        handles = self.driver.window_handles
        self.driver.switch_to.window(handles[-1])
        # self.driver.maximize_window()

        
        # Wait until the new window is loaded
        WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.ID, 'username'))
        )
        
        # Type 'de' in the search box
        self.driver.find_element(By.ID, 'username').send_keys('de')
        
        # Click on the search button
        self.driver.find_element(By.CSS_SELECTOR, 'button:nth-child(1)').click()
        
        # Wait until the results are loaded
        WebDriverWait(self.driver, 10).until(
            EC.presence_of_all_elements_located((By.CSS_SELECTOR, 'tbody td:nth-child(2)'))
        )
        
        # Click on the first result
        self.driver.find_element(By.CSS_SELECTOR, 'tbody td:nth-child(2)').click()
        
        # Wait until the new page is loaded
        WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, 'button:nth-child(3)'))
        )
        # time.sleep(3)

        search_button = self.driver.find_element(By.XPATH, "//button[contains(.,'Reset')]")
        search_button.click()
        # 


        self.driver.find_element(By.ID, 'username').send_keys('mi')
        
        # Click on the search button
        self.driver.find_element(By.CSS_SELECTOR, 'button:nth-child(1)').click()
        
        # Wait until the results are loaded
        WebDriverWait(self.driver, 10).until(
            EC.presence_of_all_elements_located((By.CSS_SELECTOR, 'tbody td:nth-child(2)'))
        )
        
        # Click on the first result
        self.driver.find_element(By.CSS_SELECTOR, 'tbody td:nth-child(2)').click()
        
        # Wait until the new page is loaded
        WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, 'button:nth-child(3)'))
        )

        search_button = self.driver.find_element(By.XPATH, "//button[contains(.,'Reset')]")
        search_button.click()
        # 

        search_button = self.driver.find_element(By.XPATH, "//button[contains(.,'Search')]")
        search_button.click()
        # 

        item_to_select = self.driver.find_element(By.XPATH, "//tbody/tr[3]/td[2]")
        item_to_select.click()
        #         
        # Click on the 'Apply' button
        self.driver.find_element(By.CSS_SELECTOR, 'button:nth-child(3)').click()
        
        # Switch back to the original window
        self.driver.switch_to.window(handles[0])
        # 
        # Wait until the new page is loaded
        WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.NAME, 'nosy'))
        )
        # 
        # Check the checkbox for 'nosy'
        self.driver.find_element(By.NAME, 'nosy').click()
        print("Test Case 3 -- success")








class TestSuperseder(unittest.TestCase):

    def setUp(self):
        options = webdriver.FirefoxOptions()
        if HEADLESS:
            options.add_argument('--headless')

        self.driver = webdriver.Firefox(options=options)

        wait = WebDriverWait(self.driver, 10)

        self.driver.get(TRACKER_URL)
        self.driver.set_window_size(786, 824)
        
        # perform admin login
        wait.until(EC.element_to_be_clickable((By.NAME, "__login_name"))).click()
        self.driver.find_element(By.NAME, "__login_name").send_keys("admin")
        self.driver.find_element(By.NAME, "__login_password").send_keys("admin")
        self.driver.find_element(By.CSS_SELECTOR, '.userblock input[type="submit"]').click()

        # create new issue test for testing purpose
        wait.until(EC.element_to_be_clickable((By.LINK_TEXT, "Create New"))).click()
        wait.until(EC.element_to_be_clickable((By.NAME, "title"))).send_keys("pytest")
        self.driver.find_element(By.NAME, "priority").send_keys('c')
        self.driver.find_element(By.NAME, "status").send_keys('t')
        self.driver.find_element(By.NAME, "keyword").send_keys('test')
        self.driver.find_element(By.NAME, "nosy").send_keys('admin')
        self.driver.find_element(By.NAME, "submit_button").click()

    def tearDown(self):
        self.driver.quit()

    def testFunctionality(self):
        wait = WebDriverWait(self.driver, 10)
        actions = ActionChains(self.driver)

        # Click on element with link text 'Create New'
        wait.until(EC.element_to_be_clickable((By.LINK_TEXT, "Create New"))).click()

        # Click on element with link text '(list)'
        wait.until(EC.element_to_be_clickable((By.LINK_TEXT, "(list)"))).click()

        # Store window handle
        main_window_handle = self.driver.current_window_handle
        # Switch to the popup window
        self.driver.switch_to.window(self.driver.window_handles[-1])
                
        selected_issue_ids = []
        
        tbody = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, ".popup-table > tbody")))
        rows = tbody.find_elements(By.CSS_SELECTOR, "tr")
        # select upto 5 odd rows
        max_select = 10 if len(rows) > 10 else len(rows)
        for i in range(0, max_select, 2):
            actions.move_to_element(rows[i]).perform()
            wait.until(EC.element_to_be_clickable(rows[i].find_element(By.TAG_NAME, "td"))).click()
            selected_issue_ids.append(rows[i].get_attribute("data-id"))
        
        # search the pytest issue with title and status
        self.driver.find_element(By.NAME, "title").send_keys("pytest")
        self.driver.find_element(By.NAME, "status").send_keys("testing")
        self.driver.find_element(By.CLASS_NAME, "search-button").click()
        
        # Click on the first result
        row = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "tbody .row-style:nth-child(1)")))
        row.find_element(By.TAG_NAME, "td").click()
        selected_issue_ids.append(row.get_attribute("data-id"))
        
        # Click on the 'Apply' button
        self.driver.find_element(By.CSS_SELECTOR, ".popup-apply").click()
        
        # Switch back to the main window
        self.driver.switch_to.window(main_window_handle)
        
        # Wait until the new page is loaded
        superseder = wait.until(EC.presence_of_element_located((By.NAME, 'superseder')))        
        superseder_value = superseder.get_attribute("value")
        
        self.assertEqual(superseder_value, ",".join(selected_issue_ids))

        self.driver.close()
        print("Test Case 4 -- success")





class TestSupersederWithKeywords(unittest.TestCase):

    def setUp(self):
        options = webdriver.FirefoxOptions()
        if HEADLESS:
            options.add_argument('--headless')

        self.driver = webdriver.Firefox(options=options)

        wait = WebDriverWait(self.driver, 10)

        self.driver.get(TRACKER_URL)
        self.driver.set_window_size(786, 824)
        
        # perform admin login
        wait.until(EC.element_to_be_clickable((By.NAME, "__login_name"))).click()
        self.driver.find_element(By.NAME, "__login_name").send_keys("admin")
        self.driver.find_element(By.NAME, "__login_password").send_keys("admin")
        self.driver.find_element(By.CSS_SELECTOR, '.userblock input[type="submit"]').click()
        
        # check if a keyword "test" exists? if not create new keyword test for testing purpose
        keyword = "test"
        wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, 'a[href="keyword?@template=item"]'))).click()
        input = wait.until(EC.element_to_be_clickable((By.NAME, "name")))
        
        keyword_exists = len(self.driver.find_elements(By.LINK_TEXT, keyword)) > 0
        if(not keyword_exists):
            input.send_keys(keyword)
            self.driver.find_element(By.NAME, "submit_button").click()


    def tearDown(self):
        self.driver.quit()

    def test_Untitled1(self):
        wait = WebDriverWait(self.driver, 10)
        actions = ActionChains(self.driver)

        # Click on element with link text 'Create New'
        wait.until(EC.element_to_be_clickable((By.LINK_TEXT, "Create New"))).click()

        # Click on element with link text '(list)'
        wait.until(EC.element_to_be_clickable((By.LINK_TEXT, "(list)"))).click()

        # Store window handle
        main_window_handle = self.driver.current_window_handle
        # Switch to the popup window
        self.driver.switch_to.window(self.driver.window_handles[-1])
                
        selected_issue_ids = []
        
        # search the pytest issue with title and status
        self.driver.find_element(By.NAME, "keyword").send_keys("test")
        self.driver.find_element(By.CLASS_NAME, "search-button").click()

        tbody = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, ".popup-table > tbody")))
        rows = tbody.find_elements(By.CSS_SELECTOR, "tr")
        # select upto 5 even rows
        max_select = 10 if len(rows) > 10 else len(rows)
        for i in range(1, max_select, 2):
            actions.move_to_element(rows[i]).perform()
            wait.until(EC.element_to_be_clickable(rows[i].find_element(By.TAG_NAME, "td"))).click()
            selected_issue_ids.append(rows[i].get_attribute("data-id"))
        
        # Click on the 'Apply' button
        self.driver.find_element(By.CSS_SELECTOR, ".popup-apply").click()
        
        # Switch back to the main window
        self.driver.switch_to.window(main_window_handle)
        
        # Wait until the new page is loaded
        superseder = wait.until(EC.presence_of_element_located((By.NAME, 'superseder')))        
        superseder_value = superseder.get_attribute("value")
        
        self.assertEqual(superseder_value, ",".join(selected_issue_ids))

        wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "tr:nth-child(3) > td:nth-child(2)"))).click()

        self.driver.close()
        print("Test Case 5 -- success")


class TestFallbackMechanism(unittest.TestCase):
    def setUp(self):
        options = webdriver.FirefoxOptions()
        if HEADLESS:
            options.add_argument('--headless')

        self.driver = webdriver.Firefox(options=options)
        
    def tearDown(self):
        self.driver.quit()
        
    def test_demo(self):
        wait = WebDriverWait(self.driver, 10)

        # Open URL /demo/
        self.driver.get(TRACKER_URL)

        # Set window size
        self.driver.set_window_size(786, 824)

        # Click on element with name '__login_name'
        wait.until(EC.element_to_be_clickable((By.NAME, "__login_name"))).click()
        # Type "admin" into the element with name attribute equal to "__login_name"
        self.driver.find_element(By.NAME, "__login_name").send_keys("admin")

        # Type "admin" into the element with name attribute equal to "__login_password"
        self.driver.find_element(By.NAME, "__login_password").send_keys("admin")

        # Click on the element with CSS selector ".userblock > input:nth-child(12)"
        self.driver.find_element(By.CSS_SELECTOR, ".userblock > input:nth-child(12)").click()

        # Click on element with link text 'Create New'
        wait.until(EC.element_to_be_clickable((By.LINK_TEXT, "Create New"))).click()
        
        print(self.driver.current_url)
        self.driver.get(self.driver.current_url + "#classhelper-wc-toggle")
        self.driver.execute_script("location.reload()")
        
        time.sleep(3)

        # Click on element with link text '(list)'
        wait.until(EC.presence_of_element_located((By.LINK_TEXT, "(list)"))).click()

        # Switch to the popup window
        self.driver.switch_to.window(self.driver.window_handles[-1])
                
        frm_help = self.driver.find_element(By.NAME, "frm_help")

        if (frm_help and frm_help.is_displayed()):
            print("Test Case 6 -- success")
        else:
            self.fail("Test Case 6 -- failed")



if __name__ == "__main__":
    unittest.main()