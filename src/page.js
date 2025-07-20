/**
 * @fileoverview enhanced page functionality with anti-detection
 * @author ovftank
 * @typedef {import('rebrowser-puppeteer').Page} Page
 * @typedef {import('rebrowser-puppeteer').MouseClickOptions} MouseClickOptions
 * @typedef {Object} TypeOptions
 * @property {number} [delay] - time to wait between key presses in milliseconds
 */

import { randomPosition, randomDelay, sleep } from './utils.js';

/**
 * @returns {string} script to inject
 */
const getWebRTCBlockScript = () => `
    Object.defineProperty(window, 'RTCPeerConnection', {
        get: () => undefined,
        set: () => {},
        configurable: false,
        enumerable: false
    });

    Object.defineProperty(window, 'RTCDataChannel', {
        get: () => undefined,
        set: () => {},
        configurable: false,
        enumerable: false
    });

    Object.defineProperty(window, 'webkitRTCPeerConnection', {
        get: () => undefined,
        set: () => {},
        configurable: false,
        enumerable: false
    });

    Object.defineProperty(window, 'mozRTCPeerConnection', {
        get: () => undefined,
        set: () => {},
        configurable: false,
        enumerable: false
    });

    Object.defineProperty(window, 'RTCIceCandidate', {
        get: () => undefined,
        set: () => {},
        configurable: false,
        enumerable: false
    });

    Object.defineProperty(window, 'RTCSessionDescription', {
        get: () => undefined,
        set: () => {},
        configurable: false,
        enumerable: false
    });

    Object.defineProperty(navigator, 'getUserMedia', {
        get: () => undefined,
        set: () => {},
        configurable: false,
        enumerable: false
    });

    Object.defineProperty(navigator, 'webkitGetUserMedia', {
        get: () => undefined,
        set: () => {},
        configurable: false,
        enumerable: false
    });

    Object.defineProperty(navigator, 'mozGetUserMedia', {
        get: () => undefined,
        set: () => {},
        configurable: false,
        enumerable: false
    });

    Object.defineProperty(navigator, 'mediaDevices', {
        get: () => undefined,
        set: () => {},
        configurable: false,
        enumerable: false
    });
`;

/**
 * page
 * @param {Page} page - puppeteer page
 * @param {Object} [proxyAuth] - proxy authentication
 * @returns {Promise<Page>} enhanced page
 */
export const enhancePage = async (page, proxyAuth = null) => {
    if (proxyAuth) {
        await page.authenticate(proxyAuth);
    }

    await page.evaluateOnNewDocument(getWebRTCBlockScript);

    await page.evaluate(() => {
        try {
            Object.defineProperty(window, 'RTCPeerConnection', {
                get: () => undefined,
                set: () => {},
                configurable: false,
                enumerable: false
            });

            Object.defineProperty(window, 'RTCDataChannel', {
                get: () => undefined,
                set: () => {},
                configurable: false,
                enumerable: false
            });

            Object.defineProperty(navigator, 'mediaDevices', {
                get: () => undefined,
                set: () => {},
                configurable: false,
                enumerable: false
            });

            delete window.RTCPeerConnection;
            delete window.RTCDataChannel;
            delete window.webkitRTCPeerConnection;
            delete window.mozRTCPeerConnection;
            delete navigator.mediaDevices;
        } catch (e) {}
    });

    /**
     * click on element with human-like behavior
     * @param {string} selector - CSS selector
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

        const { x, y } = randomPosition(box);
        await page.mouse.move(x, y);
        await sleep(randomDelay(50, 150));

        await page.mouse.down(options);
        await sleep(randomDelay(30, 80));
        await page.mouse.up(options);
    };

    /**
     * type text with human-like behavior
     * @param {string} selector - CSS selector
     * @param {string} text - text to type
     * @param {TypeOptions} [options={}] - type options
     * @returns {Promise<void>}
     */
    page.type = async (selector, text, options = {}) => {
        await page.click(selector);

        const delay = options.delay !== undefined ? options.delay : randomDelay(10, 50);

        for (const char of text) {
            await page.keyboard.type(char, { delay });
        }
    };

    return page;
};
