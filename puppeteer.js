/**
 * @fileoverview puppeteer-ghost - puppeteer library to bypass bot detection
 * @author ovftank
 * @version 0.0.1
 * @typedef {import('rebrowser-puppeteer').Browser} Browser
 * @typedef {import('rebrowser-puppeteer').Page} Page
 * @typedef {import('rebrowser-puppeteer').LaunchOptions} LaunchOptions
 * @typedef {import('rebrowser-puppeteer').MouseClickOptions} MouseClickOptions
 * @typedef {import('rebrowser-puppeteer').TypeOptions} TypeOptions
 * @typedef {import('rebrowser-puppeteer').WaitForSelectorOptions} WaitForSelectorOptions
 * @typedef {import('rebrowser-puppeteer').KeyboardTypeOptions} KeyboardTypeOptions
 * @typedef {import('puppeteer-extra').PuppeteerExtra} PuppeteerExtra
 */

import { addExtra } from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import UserPreferencesPlugin from 'puppeteer-extra-plugin-user-preferences';
import rebrowserPuppeteer from 'rebrowser-puppeteer';

/**
 * puppeteer instance
 * @type {PuppeteerExtra}
 */
const puppeteer = addExtra(rebrowserPuppeteer);
puppeteer.use(StealthPlugin());
puppeteer.use(
    UserPreferencesPlugin({
        userPrefs: {
            profile: {
                password_manager_leak_detection: false
            }
        }
    })
);

/**
 * default launch options
 * @type {LaunchOptions}
 */
const defaultOptions = {
    defaultViewport: null,
    headless: false,
    browser: 'chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled', '--disable-notifications', '--disable-extensions', '--disable-webrtc', '--disable-webrtc-encryption', '--disable-webrtc-hw-encoding', '--disable-webrtc-hw-decoding', '--disable-save-password-bubble', '--disable-features=PasswordLeakDetection']
};

/**
 * @type {function(LaunchOptions=): Promise<Browser>}
 */
const originalLaunch = puppeteer.launch.bind(puppeteer);

/**
 * launch a new browser instance
 * @param {LaunchOptions} [options={}] - Launch options
 * @returns {Promise<Browser>} - Browser instance
 */
puppeteer.launch = async (options = {}) => {
    const mergedOptions = { ...defaultOptions, ...options };

    const browser = await originalLaunch(mergedOptions);

    /**
     * @returns {Promise<Page>} - Page instance
     */
    browser.newPage = async () => {
        const pages = await browser.pages();
        /** @type {Page} */
        const page = pages[0];

        /**
         * @param {string} selector - CSS selector
         * @param {MouseClickOptions} [options={}] - Click options
         * @returns {Promise<void>}
         */
        page.click = async (selector, options = {}) => {
            await page.waitForSelector(selector, { visible: true });

            const elementHandle = await page.$(selector);
            const box = await elementHandle.boundingBox();

            if (!box) {
                throw new Error(`Element ${selector} not found or not visible`);
            }

            const x = box.x + box.width * (0.3 + Math.random() * 0.4);
            const y = box.y + box.height * (0.3 + Math.random() * 0.4);

            await page.mouse.move(x, y);

            await new Promise((r) => setTimeout(r, 50 + Math.random() * 100));

            await page.mouse.down(options);
            await new Promise((r) => setTimeout(r, 30 + Math.random() * 50));
            await page.mouse.up(options);
        };

        /**
         * @param {string} selector - CSS selector
         * @param {string} text - Text to type
         * @param {TypeOptions} [options={}] - Type options
         * @returns {Promise<void>}
         */
        page.type = async (selector, text, options = {}) => {
            await page.click(selector);

            const delay = options.delay !== undefined
                ? options.delay
                : 10 + Math.random() * 40;

            for (const char of text) {
                await page.keyboard.type(char, {
                    delay: delay
                });
            }
        };

        return page;
    };

    return browser;
};

/**
 * puppeteer-ghost - puppeteer library to bypass bot detection
 * @type {PuppeteerExtra}
 */
export default puppeteer;
