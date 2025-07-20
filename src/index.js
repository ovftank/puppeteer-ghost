/**
 * @fileoverview puppeteer-ghost - puppeteer library to bypass bot detection
 * @author ovftank
 * @version 0.0.13
 * @typedef {import('puppeteer-extra').PuppeteerExtra} PuppeteerExtra
 * @typedef {import('./browser.js').Browser} Browser
 * @typedef {import('./browser.js').GhostLaunchOptions} GhostLaunchOptions
 */

import { createPuppeteer, launchBrowser } from './browser.js';

/**
 * puppeteer instance with anti-detection
 * @type {PuppeteerExtra}
 */
const puppeteer = createPuppeteer();

/**
 * launch browser with anti-detection
 * @param {GhostLaunchOptions} [options] - launch options
 * @returns {Promise<Browser>} enhanced browser
 */
puppeteer.launch = launchBrowser;

/**
 * puppeteer-ghost - puppeteer library to bypass bot detection
 * @type {PuppeteerExtra}
 */
export default puppeteer;
