
import time
import unittest
from selenium.webdriver.common.keys import Keys
from selenium import webdriver
from selenium.webdriver.support.ui import Select
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC




class TestKeywords(unittest.TestCase):
    def setUp(self):
        # Initialize the Firefox driver with headless option setting to True.
        options = webdriver.FirefoxOptions()
        options.add_argument('--headless')

        self.driver = webdriver.Firefox(options=options)
    def tearDown(self):
        # Close the browser
        self.driver.quit()

    def test_demo1(self):
        # Open the URL
        self.driver.get('http://localhost:8917/demo/')

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
            EC.presence_of_element_located((By.CSS_SELECTOR, 'tr:nth-child(4) .classhelp'))
        )
        # 
        self.driver.find_element(By.CSS_SELECTOR, 'tr:nth-child(4) .classhelp').click()

        # Switch to the new window
        handles = self.driver.window_handles
        self.driver.switch_to.window(handles[-1])
        # self.driver.maximize_window()
        time.sleep(1)
        # Select keywords
        self.driver.find_element(By.CSS_SELECTOR, ".rowstyle:nth-child(3) > td").click()

        # Click on another element in the new window
        self.driver.find_element(By.CSS_SELECTOR, ".rowstyle:nth-child(2) > input").click()

        # Click on another element in the new window
        self.driver.find_element(By.CSS_SELECTOR, ".rowstyle:nth-child(1) > td").click()

        # Click on another element in the new window
        self.driver.find_element(By.CSS_SELECTOR, ".rowstyle:nth-child(3) > input").click()

        # Click on another element in the new window
        self.driver.find_element(By.ID, "popup-preview").click()

        element = self.driver.find_element(By.ID, "popup-preview")
        webdriver.ActionChains(self.driver).double_click(element).perform()

        # Click on another element in the new window
        self.driver.find_element(By.ID, "popup-preview").click()

        # Double-click on an element in the new window
        element = self.driver.find_element(By.ID, "popup-preview")
        webdriver.ActionChains(self.driver).double_click(element).perform()

        # Click on another element in the new window
        self.driver.find_element(By.ID, "popup-preview").click()

        # Click on another element in the new window
        self.driver.find_element(By.CSS_SELECTOR, ".acc-apply").click()
        time.sleep(1)

        # Switch back to the main window
        self.driver.switch_to.window(handles[0])

        # Wait until the new page is loaded
        WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.NAME, 'keyword'))
        )

        # Check if the keyword input is filled with the selected keywords
        keyword_input = self.driver.find_element(By.NAME, "keyword")
        self.driver.find_element(By.NAME, 'keyword').click()
        time.sleep(1)
        print("TestCase 1 -- success")






class TestNosy(unittest.TestCase):
    def setUp(self):
        # Initialize the Firefox driver with headless option setting to True.
        options = webdriver.FirefoxOptions()
        options.add_argument('--headless')

        self.driver = webdriver.Firefox(options=options)

    def tearDown(self):
        # Close the browser
        self.driver.quit()

    def test_demo(self):
        # Open the URL
        self.driver.get('http://localhost:8917/demo/')
        
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
        print("Test Case 2 -- success")






class TestNosy1(unittest.TestCase):
    def setUp(self):
        # Initialize the Firefox driver with headless option setting to True.
        options = webdriver.FirefoxOptions()
        options.add_argument('--headless')

        self.driver = webdriver.Firefox(options=options)

    def tearDown(self):
        # Close the browser
        self.driver.quit()

    def test_demo1(self):
        # Open the URL
        self.driver.get('http://localhost:8917/demo/')
        
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
        options.add_argument('--headless')

        self.driver = webdriver.Firefox(options=options)


    def tearDown(self):
        self.driver.quit()

    def test_Untitled(self):
        wait = WebDriverWait(self.driver, 10)

        # Open URL /demo/
        self.driver.get("http://localhost:8917/demo/")

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

        # Click on element with link text '(list)'
        wait.until(EC.element_to_be_clickable((By.LINK_TEXT, "(list)"))).click()

        # Store window handle
        main_window_handle = self.driver.current_window_handle

        # Switch to the popup window
        for handle in self.driver.window_handles:
            if handle != main_window_handle:
                self.driver.switch_to.window(handle)

        wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "tr:nth-child(3) > td:nth-child(2)"))).click()
        self.driver.find_element(By.ID, "title").send_keys("dui")
        self.driver.find_element(By.CSS_SELECTOR, ".search-button").click()
        WebDriverWait(self.driver, 10).until(EC.presence_of_element_located((By.CSS_SELECTOR, ".rowstyle:nth-child(2) > td:nth-child(2)")))
        self.driver.find_element(By.CSS_SELECTOR, ".rowstyle:nth-child(2) > td:nth-child(2)").click()
        time.sleep(1)
        # Set status to need-eg
        self.driver.find_element(By.ID, "status").click()
        
        time.sleep(1)
        self.driver.find_element(By.ID, "status").send_keys("c",Keys.ENTER)

        # self.driver.find_element(By.CSS_SELECTOR, "option[value='need-eg']").click()
        self.driver.find_element(By.CSS_SELECTOR, ".search-button").click()
        time.sleep(1)
        # Click the first result

        WebDriverWait(self.driver, 10).until(EC.presence_of_element_located((By.CSS_SELECTOR, ".rowstyle:nth-child(1) > td:nth-child(2)")))
        time.sleep(1)

        self.driver.find_element(By.CSS_SELECTOR, ".rowstyle:nth-child(1) > td:nth-child(2)").click()
        time.sleep(1)
        # Set keyword to eawe
        self.driver.find_element(By.ID, "keyword").send_keys("hi",Keys.ENTER)
        # self.driver.find_element(By.CSS_SELECTOR, "option[value='eawe']").click()
        self.driver.find_element(By.CSS_SELECTOR, ".search-button").click()

        self.driver.find_element(By.CSS_SELECTOR, ".acc-apply").click()
        time.sleep(1)

        self.driver.switch_to.window(self.driver.window_handles[0])
        self.driver.find_element(By.NAME, "superseder").click()
        time.sleep(1)

        # Step 19: Close the current window
        self.driver.close()
        print("Test Case 4 -- success")






class TestSupersederWithKeywords(unittest.TestCase):

    def setUp(self):
        options = webdriver.FirefoxOptions()
        options.add_argument('--headless')

        self.driver = webdriver.Firefox(options=options)


    def tearDown(self):
        self.driver.quit()

    def test_Untitled1(self):
        wait = WebDriverWait(self.driver, 10)

        # Open URL /demo/
        self.driver.get("http://localhost:8917/demo/")

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

        # Click on element with link text '(list)'
        wait.until(EC.element_to_be_clickable((By.LINK_TEXT, "(list)"))).click()

        # Store window handle
        main_window_handle = self.driver.current_window_handle

        # Switch to the popup window
        for handle in self.driver.window_handles:
            if handle != main_window_handle:
                self.driver.switch_to.window(handle)

        wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "tr:nth-child(3) > td:nth-child(2)"))).click()

        self.driver.find_element(By.ID, "title").click()
        self.driver.find_element(By.ID, "title").send_keys("dui", Keys.ENTER)
        time.sleep(1)
        self.driver.find_element(By.ID, "title").send_keys("\n")
        self.driver.find_element(By.CSS_SELECTOR, ".rowstyle:nth-child(1) > td:nth-child(2)").click()

        time.sleep(1)
        self.driver.find_element(By.ID, "status").click()

        # Use the Select class to work with dropdowns
        status_dropdown = Select(self.driver.find_element(By.ID, "status"))

        # Use the select_by_visible_text method to select "chatting"
        status_dropdown.select_by_visible_text("chatting")

        # Press Enter to select the "chatting" option
        self.driver.find_element(By.ID, "status").send_keys(Keys.ENTER)
        # self.driver.find_element(By.ID, "status").click()
        time.sleep(1)
        # self.driver.find_element(By.ID, "status").send_keys("label=chatting",Keys.ENTER) 
        time.sleep(1)   
        self.driver.find_element(By.CSS_SELECTOR, ".search-button").click()
        time.sleep(1)
        self.driver.find_element(By.CSS_SELECTOR, ".rowstyle:nth-child(3) > td:nth-child(2)").click()
        self.driver.find_element(By.ID, "keyword").click()
        time.sleep(1)
        status_dropdown = Select(self.driver.find_element(By.ID, "keyword"))

        # self.driver.find_element(By.ID, "keyword").send_keys("label=hey")
        status_dropdown.select_by_visible_text("hey")

        # Press Enter to select the "chatting" option
        self.driver.find_element(By.ID, "keyword").send_keys(Keys.ENTER)
        # self.driver.find_element(By.ID, "status").click()
        time.sleep(1)
        # self.driver.find_element(By.ID, "status").send_keys("label=chatting",Keys.ENTER) 
        time.sleep(1)   
        self.driver.find_element(By.CSS_SELECTOR, ".search-button").click()

        # self.driver.find_element(By.CSS_SELECTOR, ".search-button").click()
        time.sleep(1)
        self.driver.find_element(By.CSS_SELECTOR, ".acc-apply").click()
        time.sleep(1)
        self.driver.switch_to.window(self.driver.window_handles[0])
        self.driver.find_element(By.NAME, "superseder").click()
        time.sleep(1)

        # Step 18: Click on element with name 'superseder'
        wait.until(EC.element_to_be_clickable((By.NAME, "superseder"))).click()
        time.sleep(1)
        # Step 19: Close the current window
        self.driver.close()
        print("Test Case 5 -- success")






if __name__ == "__main__":
    unittest.main()