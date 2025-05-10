import pytest
from playwright.sync_api import sync_playwright

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
    page.goto("http://localhost:3000/signup")
    page.fill("input[name=username]", "testuser")
    page.fill("input[name=password]", "testpass123")
    page.fill("input[name=firstname]", "Test")
    page.fill("input[name=lastname]", "User")
    page.click("button[type=submit]")
    assert page.url == "http://localhost:3000/login"

def test_login_flow(page):
    page.goto("http://localhost:3000/login")
    page.fill("input[name=username]", "testuser")
    page.fill("input[name=password]", "testpass123")
    page.click("button[type=submit]")
    assert page.url == "http://localhost:3000/dashboard"

def test_file_upload_flow(page):
    page.goto("http://localhost:3000/upload")
    with page.expect_file_chooser() as fc_info:
        page.click("button#upload-button")
    file_chooser = fc_info.value
    file_chooser.set_files("path/to/sample.csv")
    page.click("button[type=submit]")
    assert page.inner_text("div#result") == "File processed successfully"