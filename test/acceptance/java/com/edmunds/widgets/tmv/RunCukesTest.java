package com.edmunds.widgets.tmv;

import java.util.concurrent.TimeUnit;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.phantomjs.PhantomJSDriver;
import org.openqa.selenium.remote.DesiredCapabilities;

import cucumber.api.CucumberOptions;
import cucumber.api.java.After;
import cucumber.api.java.Before;
import cucumber.api.testng.AbstractTestNGCucumberTests;

@CucumberOptions(format = "json:target/cucumber-report.json")
public class RunCukesTest extends AbstractTestNGCucumberTests {

    private static String baseUrl;
    private static WebDriver driver;

    @Before
    public void setUp() {
        if (System.getProperty("inBrowser") == null) {
            DesiredCapabilities dCaps = new DesiredCapabilities();
            dCaps.setJavascriptEnabled(true);
            dCaps.setCapability("takesScreenshot", false);
            driver = new PhantomJSDriver(dCaps);
        } else {
            driver = new FirefoxDriver(DesiredCapabilities.firefox());
        }
        driver.manage().timeouts().implicitlyWait(10, TimeUnit.SECONDS);
    }
    
    @After
    public void tearDown() {
        driver.quit();
    }
    
    public static String getUrl(String page) {
        return baseUrl + page;
    }
    
    public static WebDriver getDriver() {
        return driver;
    }
}
