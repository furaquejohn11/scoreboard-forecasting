import pytest
from playwright.sync_api import sync_playwright
from openpyxl import Workbook
import os
import tempfile

# BEFORE RUNNING MAKE SURE THAT testuser IS NOT EXISTING
# IF YES, DELETE THE RECORD FIRST
@pytest.fixture(scope="session")
def playwright():
    with sync_playwright() as p:
        yield p

@pytest.fixture
def browser(playwright):
    browser = playwright.chromium.launch(headless=False)
    yield browser
    browser.close()

@pytest.fixture
def page(browser):
    page = browser.new_page()
    yield page
    page.close()

def test_signup_flow(page):
    # Navigate to the signup page
    page.goto("http://localhost:3000/signup")

    # Fill the form fields
    page.fill("input[name=username]", "testuser")
    page.fill("input[name=password]", "testpass123")
    page.fill("input[name=confirm-password]", "testpass123")
    page.fill("input[name=firstname]", "Test")
    page.fill("input[name=lastname]", "User")
    page.click("button[type=submit]")

    page.wait_for_url("http://localhost:3000/login")
    assert page.url == "http://localhost:3000/login"

def test_login_flow(page):
    # Navigate to the login page
    page.goto("http://localhost:3000/login")

    # Fill the form fields using id selectors (since name attributes are not explicitly set)
    page.fill("#username", "testuser")
    page.fill("#password", "testpass123")

    # Click the submit button
    page.click("button[type=submit]")

    # Wait for navigation to the dashboard
    page.wait_for_url("http://localhost:3000/dashboard")

    # Assert the URL is correct
    assert page.url == "http://localhost:3000/dashboard"

def test_file_upload_flow(page):
    # Mock the login API response
    page.route("http://127.0.0.1:8000/api/user/login", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body='{"username": "testuser", "token": "fake-token"}'
    ))

    # Navigate to the login page
    page.goto("http://localhost:3000/login")

    # Fill the login form
    page.fill("#username", "testuser")
    page.fill("#password", "testpass123")
    page.click("button[type=submit]")

    # Wait for navigation to the dashboard
    page.wait_for_url("http://localhost:3000/dashboard")

    # Mock the file upload API response
    page.route("http://127.0.0.1:8000/api/file/upload-excel", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body='{"filename": "test_data.xlsx", "message": "File uploaded successfully", "row_count": 1}'
    ))

    # Navigate to the upload page
    page.goto("http://localhost:3000/upload")

    # Create a temporary Excel file with the sample format
    with tempfile.NamedTemporaryFile(suffix='.xlsx', delete=False) as temp_file:
        temp_file_path = temp_file.name

        # Create an Excel workbook
        wb = Workbook()
        ws = wb.active
        ws.title = "Sheet1"

        # Define column headers
        headers = [
            "PROVINCE",
            "MUNICIPALITY/CITY",
            "BARANGAY",
            "HOUSEHOLD ID",
            "FIRST NAME",
            "MIDDLE NAME",
            "LAST NAME",
            "SEX",
            "AGE",
            "SOCIAL SERVICE / PROGRAM",
            "TYPE OF ASSISTANCE PROVIDED",
            "SPECIFY (name of skill training, name of training, specific assistance, goods, amount, and others)",
            "REMARKS (specify agency, individual, organization who provided the assistance and any other pertinent details)",
            "DATE RECEIVED (MM/DD/YYYY)"
        ]
        ws.append(headers)

        # Add sample data
        sample_data = [
            "Laguna",
            "Cavinti",
            "Zapote",
            778,
            "Ana",
            "Santos",
            "Gómez",
            "Female",
            72,
            "SOCIAL_PENSION",
            "Parent Effectiveness Trainings",
            "Enhanced support",
            "DOH - Regular program",
            "04/30/2022"
        ]
        ws.append(sample_data)

        # Save the workbook to the temporary file
        wb.save(temp_file_path)

    # Option: Use synthetic_datas.xlsx if available
    # temp_file_path = os.path.abspath("synthetic_datas.xlsx")

    # Trigger the file chooser by clicking the label for the file input
    with page.expect_file_chooser() as fc_info:
        page.click("label[for=file-upload]")
    file_chooser = fc_info.value
    file_chooser.set_files(temp_file_path)

    # Click the upload button
    page.click("button:has-text('Upload and Process')")

    # Handle the alert
    page.once("dialog", lambda dialog: dialog.accept())

    # Wait for navigation to the dashboard
    page.wait_for_url("http://localhost:3000/dashboard")

    # Assert the URL is correct
    assert page.url == "http://localhost:3000/dashboard"

    # Clean up the temporary file
    os.unlink(temp_file_path)