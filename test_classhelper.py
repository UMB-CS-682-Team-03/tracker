
import time
import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class TestSuperseder(unittest.TestCase):

    def setUp(self):
        options = webdriver.FirefoxOptions()
        options.add_argument('--headless')

        self.driver = webdriver.Firefox(options=options)


    def tearDown(self):
        self.driver.quit()

    def test_Untitled(self):
        wait = WebDriverWait(self.driver, 10)

        # Step 1: Open URL /demo/
        self.driver.get("http://localhost:8917/demo/")

        # Step 2: Set window size
        self.driver.set_window_size(786, 824)

        # Step 3: Click on element with name '__login_name'
        wait.until(EC.element_to_be_clickable((By.NAME, "__login_name"))).click()

        # Step 4: Type 'admin' into element with name '__login_name'
        wait.until(EC.element_to_be_clickable((By.NAME, "__login_name"))).send_keys("admin")

        # Step 5: Click on element with name '__login_password'
        wait.until(EC.element_to_be_clickable((By.NAME, "__login_password"))).click()

        # Step 6: Type 'admin' into element with name '__login_password'
        wait.until(EC.element_to_be_clickable((By.NAME, "__login_password"))).send_keys("admin")

        # Step 7: Click on element with CSS selector '.userblock > input:nth-child(12)'
        wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, ".userblock > input:nth-child(12)"))).click()

        # Step 8: Click on element with link text 'Create New'
        wait.until(EC.element_to_be_clickable((By.LINK_TEXT, "Create New"))).click()

        # Step 9: Click on element with link text '(list)'
        wait.until(EC.element_to_be_clickable((By.LINK_TEXT, "(list)"))).click()

        # Step 10: Store window handle
        main_window_handle = self.driver.current_window_handle

        # Step 11: Switch to the popup window
        for handle in self.driver.window_handles:
            if handle != main_window_handle:
                self.driver.switch_to.window(handle)

        # Step 12: Click on element with CSS selector 'tr:nth-child(3) > td:nth-child(2)'
        wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "tr:nth-child(3) > td:nth-child(2)"))).click()

        # Step 13: Click on element with CSS selector 'tr:nth-child(5) > td:nth-child(2)'
        wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "tr:nth-child(5) > td:nth-child(2)"))).click()
        # 
        # Step 14: Click on element with CSS selector 'button:nth-child(1)'
        wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "button:nth-child(1)"))).click()
        # 
        # Step 15: Click on element with CSS selector 'tr:nth-child(4) > td:nth-child(2)'
        wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "tr:nth-child(4) > td:nth-child(2)"))).click()
        # 


        wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "button:nth-child(1)"))).click()
        # 
        wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "tr:nth-child(6) > td:nth-child(2)"))).click()
        # 

        # Step 16: Click on element with CSS selector 'button:nth-child(3)'
        wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "button:nth-child(3)"))).click()
        # time.sleep(2)
        # Step 17: Switch back to the main window
        self.driver.switch_to.window(main_window_handle)

        # Step 18: Click on element with name 'superseder'AER4
        wait.until(EC.element_to_be_clickable((By.NAME, "superseder"))).click()
        # time.sleep(2)
        # Step 19: Close the current window
        self.driver.close()
        print("Test Case 3 -- success")



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

        # Select keywords
        self.driver.find_element(By.XPATH, "//table[@id='popup-table']/tbody/tr[2]/td").click()
        # 
        self.driver.find_element(By.XPATH, "//table[@id='popup-table']/tbody/tr[3]/td").click()
        # 
        self.driver.find_element(By.XPATH, "//table[@id='popup-table']/tbody/tr[4]/td").click()
        # 
        self.driver.find_element(By.XPATH, "//table[@id='popup-table']/tbody/tr[2]/td").click()
        # 
        # Click on Apply
        self.driver.find_element(By.CSS_SELECTOR, "button:nth-child(3)").click()
        # 
        # Switch back to the original window
        self.driver.switch_to.window(handles[0])

        # Wait until the new page is loaded
        WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.NAME, 'keyword'))
        )
        # 

        # Check if the keyword input is filled with the selected keywords
        keyword_input = self.driver.find_element(By.NAME, "keyword")
        self.driver.find_element(By.NAME, 'keyword').click()
        print("TestCase 1 -- success")


if __name__ == "__main__":
    unittest.main()