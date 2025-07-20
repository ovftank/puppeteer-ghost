/**
 * @fileoverview enhanced browser functionality with anti-detection
 * @author ovftank
 * @typedef {import('rebrowser-puppeteer').Browser} Browser
 * @typedef {import('rebrowser-puppeteer').Page} Page
 * @typedef {import('rebrowser-puppeteer').LaunchOptions} LaunchOptions
 * @typedef {import('rebrowser-puppeteer').MouseClickOptions} MouseClickOptions
 * @typedef {import('puppeteer-extra').PuppeteerExtra} PuppeteerExtra
 * @typedef {Object} ProxyConfig
 * @property {string} server - proxy server address
 * @property {string} [username] - proxy username (if required)
 * @property {string} [password] - proxy password (if required)
 * @typedef {LaunchOptions & {proxy?: ProxyConfig}} GhostLaunchOptions
 * @typedef {Object} TypeOptions
 * @property {number} [delay] - time to wait between key presses in milliseconds
 */

import { addExtra } from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import UserPreferencesPlugin from 'puppeteer-extra-plugin-user-preferences';
import rebrowserPuppeteer from 'rebrowser-puppeteer';

import { DEFAULT_LAUNCH_OPTIONS, USER_PREFERENCES } from './config.js';
import { findChromePath, processProxyConfig } from './utils.js';
import { enhancePage } from './page.js';

/**
 * create enhanced puppeteer instance
 * @returns {PuppeteerExtra} enhanced puppeteer
 */
export const createPuppeteer = () => {
    const puppeteer = addExtra(rebrowserPuppeteer);

    puppeteer.use(StealthPlugin());

    puppeteer.use(UserPreferencesPlugin(USER_PREFERENCES));

    return puppeteer;
};

/**
 * enhanced browser features
 * @param {Browser} browser - original browser
 * @param {Object} [proxyAuth] - proxy authentication
 * @returns {Browser} enhanced browser
 */
export const enhanceBrowser = (browser, proxyAuth = null) => {
    /**
     * create new page with anti-detection
     * @returns {Promise<Page>}
     */
    browser.newPage = async () => {
        const pages = await browser.pages();
        const page = pages[0];
        return enhancePage(page, proxyAuth);
    };

    return browser;
};

/**
 * launch browser with anti-detection
 * @param {GhostLaunchOptions} [options={}] - launch options
 * @returns {Promise<Browser>} enhanced browser
 */
export const launchBrowser = async (options = {}) => {
    const puppeteer = createPuppeteer();
    const originalLaunch = puppeteer.launch.bind(puppeteer);

    const mergedOptions = { ...DEFAULT_LAUNCH_OPTIONS, ...options };

    const proxyConfig = processProxyConfig(mergedOptions.proxy);

    if (proxyConfig) {
        mergedOptions.args.push(`--proxy-server=${proxyConfig.server}`);
        delete mergedOptions.proxy;
    }

    if (!mergedOptions.executablePath) {
        const chromePath = await findChromePath();
        if (chromePath) {
            mergedOptions.executablePath = chromePath;
        }
    }

    const browser = await originalLaunch(mergedOptions);

    return enhanceBrowser(browser, proxyConfig?.auth);
};
