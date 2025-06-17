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
 * @typedef {Object} ProxyConfig
 * @property {string} server - proxy server address
 * @property {string} [username] - proxy username (if required)
 * @property {string} [password] - proxy password (if required)
 * @typedef {Object} GhostLaunchOptions
 * @property {ProxyConfig} [proxy] - proxy configuration
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
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled', '--disable-notifications', '--disable-extensions', '--disable-webrtc', '--disable-webrtc-encryption', '--disable-webrtc-hw-encoding', '--disable-webrtc-hw-decoding', '--disable-webrtc-multiple-routes', '--disable-webrtc-hide-local-ips-with-mdns', '--disable-webrtc-apm-downmix-capture-audio-method', '--disable-chrome-wide-echo-cancellation', '--disable-webrtc-allow-wgc-screen-capturer', '--disable-webrtc-allow-wgc-window-capturer', '--disable-webrtc-wgc-require-border', '--disable-save-password-bubble', '--disable-features=PasswordLeakDetection']
};

/**
 * @type {function(LaunchOptions=): Promise<Browser>}
 */
const originalLaunch = puppeteer.launch.bind(puppeteer);

/**
 * check if Chrome is installed
 * @returns {Promise<string|null>} path to Chrome or null if not found
 */
const findChromePath = async () => {
    const paths = ['C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable'];

    for (const path of paths) {
        try {
            await import('fs').then((fs) => fs.promises.access(path));
            return path;
        } catch {}
    }

    return null;
};

/**
 * launch a new browser instance
 * @param {GhostLaunchOptions} [options={}] - launch options
 * @returns {Promise<Browser>} - browser instance
 */
puppeteer.launch = async (options = {}) => {
    const mergedOptions = { ...defaultOptions, ...options };

    if (mergedOptions.proxy?.server) {
        mergedOptions.args.push(`--proxy-server=${mergedOptions.proxy.server}`);
        delete mergedOptions.proxy;
    }

    if (!mergedOptions.executablePath) {
        const chromePath = await findChromePath();
        if (chromePath) {
            mergedOptions.executablePath = chromePath;
        }
    }

    const browser = await originalLaunch(mergedOptions);

    /**
     * @returns {Promise<Page>} - page instance
     */
    browser.newPage = async () => {
        const pages = await browser.pages();
        /** @type {Page} */
        const page = pages[0];

        if (options.proxy?.username && options.proxy?.password) {
            await page.authenticate({
                username: options.proxy.username,
                password: options.proxy.password
            });
        }

        await page.evaluateOnNewDocument(() => {
            const rtcObject = {
                createDataChannel: () => null,
                createOffer: () => null,
                createAnswer: () => null,
                setLocalDescription: () => null,
                setRemoteDescription: () => null
            };

            window.RTCPeerConnection = function () {
                return rtcObject;
            };
            window.webkitRTCPeerConnection = function () {
                return rtcObject;
            };
        });

        /**
         * @param {string} selector - css selector
         * @param {MouseClickOptions} [options={}] - click options
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
         * @param {string} selector - css selector
         * @param {string} text - text to type
         * @param {TypeOptions} [options={}] - type options
         * @returns {Promise<void>}
         */
        page.type = async (selector, text, options = {}) => {
            await page.click(selector);

            const delay = options.delay !== undefined ? options.delay : 10 + Math.random() * 40;

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
