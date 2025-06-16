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
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled', '--disable-notifications', '--disable-extensions', '--disable-webrtc', '--disable-webrtc-encryption', '--disable-webrtc-hw-encoding', '--disable-webrtc-hw-decoding', '--disable-save-password-bubble', '--disable-features=PasswordLeakDetection', '--disable-dev-shm-usage', '--disable-accelerated-2d-canvas', '--no-first-run', '--no-zygote', '--disable-gpu', '--disable-web-security', '--disable-features=VizDisplayCompositor', '--disable-background-timer-throttling', '--disable-backgrounding-occluded-windows', '--disable-renderer-backgrounding', '--disable-field-trial-config', '--disable-back-forward-cache', '--disable-ipc-flooding-protection', '--disable-hang-monitor', '--disable-prompt-on-repost', '--disable-sync', '--disable-domain-reliability', '--disable-component-extensions-with-background-pages', '--disable-default-apps', '--disable-plugins', '--disable-translate', '--disable-background-networking', '--disable-background-mode', '--disable-client-side-phishing-detection', '--disable-component-update', '--disable-datasaver-prompt', '--disable-desktop-notifications', '--disable-features=TranslateUI', '--disable-infobars', '--disable-offer-store-unmasked-wallet-cards', '--disable-offer-upload-credit-cards', '--disable-password-generation', '--disable-print-preview', '--disable-voice-input', '--disable-wake-on-wifi', '--enable-async-dns', '--enable-simple-cache-backend', '--enable-tcp-fast-open', '--media-cache-size=33554432', '--aggressive-cache-discard']
};

const originalLaunch = puppeteer.launch.bind(puppeteer);
puppeteer.launch = async (options = {}) => {
    const mergedOptions = { ...defaultOptions, ...options };

    const browser = await originalLaunch(mergedOptions);

    const originalNewPage = browser.newPage.bind(browser);
    browser.newPage = async () => {
        /** @type {import('rebrowser-puppeteer').Page} */
        const page = await originalNewPage();

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
 * @namespace
 */
export default puppeteer;
