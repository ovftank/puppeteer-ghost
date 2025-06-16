/**
 * @fileoverview puppeteer-ghost - puppeteer library to bypass bot detection
 * @author ovftank
 * @version 0.0.1
 */

import { addExtra } from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import UserPreferencesPlugin from 'puppeteer-extra-plugin-user-preferences';
import rebrowserPuppeteer from 'rebrowser-puppeteer';

/** @type {import('puppeteer-extra').PuppeteerExtra} */
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
 * Default launch options with stealth configurations
 * @type {import('rebrowser-puppeteer').LaunchOptions}
 */
const defaultOptions = {
    defaultViewport: null,
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled', '--disable-notifications', '--disable-extensions', '--disable-webrtc', '--disable-webrtc-encryption', '--disable-webrtc-hw-encoding', '--disable-webrtc-hw-decoding', '--disable-save-password-bubble', '--disable-features=PasswordLeakDetection']
};

const originalLaunch = puppeteer.launch.bind(puppeteer);
puppeteer.launch = async (options = {}) => {
    const mergedOptions = { ...defaultOptions, ...options };

    const browser = await originalLaunch(mergedOptions);

    browser.newPage = async () => {
        const pages = await browser.pages();
        /** @type {import('rebrowser-puppeteer').Page} */
        const page = pages[0];

        /**
         * click method with human-like behavior
         * @param {string} selector - CSS selector
         * @param {import('rebrowser-puppeteer').MouseClickOptions} [options={}] - Click options
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
         * type with human-like behavior
         * @param {string} selector - CSS selector
         * @param {string} text - Text to type
         * @param {import('rebrowser-puppeteer').TypeOptions} [options={}] - Type options
         * @returns {Promise<void>}
         */
        page.type = async (selector, text, options = {}) => {
            await page.click(selector);

            for (const char of text) {
                await page.keyboard.type(char, {
                    delay: 10 + Math.random() * 40,
                    ...options
                });
            }
        };

        return page;
    };

    return browser;
};

/**
 * puppeteer-ghost - puppeteer library to bypass bot detection
 * @type {import('puppeteer-extra').PuppeteerExtra}
 */
export default puppeteer;
