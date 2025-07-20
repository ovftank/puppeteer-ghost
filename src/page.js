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
    (() => {
        const noop = () => {};
        const noopAsync = () => Promise.reject(new DOMException('Operation not supported', 'NotSupportedError'));
        const noopConstructor = function() { throw new TypeError('Illegal constructor'); };

        const webrtcAPIs = [
            'RTCPeerConnection', 'RTCDataChannel', 'webkitRTCPeerConnection',
            'mozRTCPeerConnection', 'RTCIceCandidate', 'RTCSessionDescription',
            'RTCStatsReport', 'RTCRtpSender', 'RTCRtpReceiver', 'RTCRtpTransceiver',
            'RTCDtlsTransport', 'RTCIceTransport', 'RTCSctpTransport',
            'RTCRtpContributingSource', 'RTCRtpSynchronizationSource',
            'RTCDTMFSender', 'RTCDTMFToneChangeEvent', 'RTCDataChannelEvent',
            'RTCPeerConnectionIceEvent', 'RTCPeerConnectionIceErrorEvent',
            'RTCTrackEvent', 'RTCErrorEvent', 'RTCCertificate'
        ];

        const blockAPI = (obj, prop, value = undefined) => {
            try {
                if (obj[prop]) {
                    delete obj[prop];
                }
                Object.defineProperty(obj, prop, {
                    get: () => value,
                    set: noop,
                    configurable: false,
                    enumerable: false,
                    writable: false
                });
            } catch (e) {}
        };

        webrtcAPIs.forEach(api => {
            blockAPI(window, api, noopConstructor);
            if (window[api]) {
                try {
                    window[api] = noopConstructor;
                } catch (e) {}
            }
        });

        const navigatorAPIs = ['getUserMedia', 'webkitGetUserMedia', 'mozGetUserMedia', 'msGetUserMedia'];
        navigatorAPIs.forEach(api => {
            blockAPI(navigator, api);
            if (navigator[api]) {
                try {
                    navigator[api] = undefined;
                } catch (e) {}
            }
        });

        blockAPI(navigator, 'mediaDevices');
        if (navigator.mediaDevices) {
            try {
                navigator.mediaDevices = undefined;
            } catch (e) {}
        }

        if (navigator.permissions && navigator.permissions.query) {
            const originalQuery = navigator.permissions.query;
            navigator.permissions.query = (params) => {
                if (params && (params.name === 'camera' || params.name === 'microphone')) {
                    return Promise.resolve({ state: 'denied', onchange: null });
                }
                return originalQuery.call(navigator.permissions, params);
            };
        }

        const originalCreateElement = document.createElement;
        document.createElement = function(tagName) {
            const element = originalCreateElement.call(this, tagName);
            if (tagName.toLowerCase() === 'iframe') {
                const originalSrc = Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, 'src') ||
                                  Object.getOwnPropertyDescriptor(Element.prototype, 'src');
                if (originalSrc && originalSrc.set) {
                    Object.defineProperty(element, 'src', {
                        get: originalSrc.get,
                        set: function(value) {
                            if (value && (value.includes('stun:') || value.includes('turn:'))) {
                                return;
                            }
                            return originalSrc.set.call(this, value);
                        },
                        configurable: true,
                        enumerable: true
                    });
                }
            }
            return element;
        };

        const blockWebRTCCompletely = () => {
            webrtcAPIs.forEach(api => {
                if (window[api]) {
                    try {
                        delete window[api];
                        window[api] = noopConstructor;
                        Object.defineProperty(window, api, {
                            get: () => noopConstructor,
                            set: noop,
                            configurable: false,
                            enumerable: false
                        });
                    } catch (e) {}
                }
            });

            if (navigator.mediaDevices) {
                try {
                    delete navigator.mediaDevices;
                    navigator.mediaDevices = undefined;
                    Object.defineProperty(navigator, 'mediaDevices', {
                        get: () => undefined,
                        set: noop,
                        configurable: false,
                        enumerable: false
                    });
                } catch (e) {}
            }

            navigatorAPIs.forEach(api => {
                if (navigator[api]) {
                    try {
                        delete navigator[api];
                        navigator[api] = undefined;
                        Object.defineProperty(navigator, api, {
                            get: () => undefined,
                            set: noop,
                            configurable: false,
                            enumerable: false
                        });
                    } catch (e) {}
                }
            });

            ['MediaStream', 'MediaStreamTrack', 'MediaDevices'].forEach(api => {
                if (window[api]) {
                    try {
                        delete window[api];
                        window[api] = noopConstructor;
                        Object.defineProperty(window, api, {
                            get: () => noopConstructor,
                            set: noop,
                            configurable: false,
                            enumerable: false
                        });
                    } catch (e) {}
                }
            });
        };

        blockWebRTCCompletely();

        const observer = new MutationObserver(blockWebRTCCompletely);
        observer.observe(document.documentElement, {
            childList: true,
            subtree: true,
            attributes: true
        });

        setInterval(blockWebRTCCompletely, 10);

        ['DOMContentLoaded', 'load', 'beforeunload', 'pageshow'].forEach(event => {
            document.addEventListener(event, blockWebRTCCompletely, true);
        });

        if (typeof window.addEventListener === 'function') {
            window.addEventListener('beforeunload', blockWebRTCCompletely, true);
        }

        const originalFetch = window.fetch;
        window.fetch = function(...args) {
            const url = args[0];
            if (typeof url === 'string' && (url.includes('stun:') || url.includes('turn:') || url.includes('webrtc'))) {
                return Promise.reject(new Error('WebRTC blocked'));
            }
            return originalFetch.apply(this, args);
        };

        const originalXMLHttpRequest = window.XMLHttpRequest;
        window.XMLHttpRequest = function() {
            const xhr = new originalXMLHttpRequest();
            const originalOpen = xhr.open;
            xhr.open = function(method, url, ...args) {
                if (typeof url === 'string' && (url.includes('stun:') || url.includes('turn:') || url.includes('webrtc'))) {
                    throw new Error('WebRTC blocked');
                }
                return originalOpen.apply(this, [method, url, ...args]);
            };
            return xhr;
        };

        if (window.WebSocket) {
            const originalWebSocket = window.WebSocket;
            window.WebSocket = function(url, ...args) {
                if (typeof url === 'string' && (url.includes('stun:') || url.includes('turn:') || url.includes('webrtc'))) {
                    throw new Error('WebRTC blocked');
                }
                return new originalWebSocket(url, ...args);
            };
        }

        const overrideProperty = (obj, prop, value) => {
            try {
                Object.defineProperty(obj, prop, {
                    get: () => value,
                    set: () => {},
                    configurable: false,
                    enumerable: false
                });
            } catch (e) {}
        };

        overrideProperty(window, 'RTCPeerConnection', undefined);
        overrideProperty(window, 'webkitRTCPeerConnection', undefined);
        overrideProperty(window, 'mozRTCPeerConnection', undefined);
        overrideProperty(navigator, 'getUserMedia', undefined);
        overrideProperty(navigator, 'webkitGetUserMedia', undefined);
        overrideProperty(navigator, 'mozGetUserMedia', undefined);
        overrideProperty(navigator, 'mediaDevices', undefined);

        if (typeof Object.freeze === 'function') {
            try {
                Object.freeze(navigator);
                Object.freeze(window);
            } catch (e) {}
        }
    })();
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

    await page.evaluateOnNewDocument(`
        (() => {
            'use strict';
            const noop = () => {};
            const noopConstructor = function() { throw new TypeError('Illegal constructor'); };

            const apis = ['RTCPeerConnection', 'webkitRTCPeerConnection', 'mozRTCPeerConnection', 'RTCDataChannel'];
            apis.forEach(api => {
                try {
                    delete window[api];
                    Object.defineProperty(window, api, {
                        get: () => undefined,
                        set: noop,
                        configurable: false,
                        enumerable: false
                    });
                } catch (e) {}
            });

            const navApis = ['getUserMedia', 'webkitGetUserMedia', 'mozGetUserMedia', 'mediaDevices'];
            navApis.forEach(api => {
                try {
                    delete navigator[api];
                    Object.defineProperty(navigator, api, {
                        get: () => undefined,
                        set: noop,
                        configurable: false,
                        enumerable: false
                    });
                } catch (e) {}
            });
        })();
    `);

    const client = await page.createCDPSession();

    await client.send('Network.enable');

    try {
        await client.send('Browser.setPermission', {
            permission: 'camera',
            setting: 'denied'
        });
        await client.send('Browser.setPermission', {
            permission: 'microphone',
            setting: 'denied'
        });
    } catch (e) {}

    try {
        await client.send('Network.setUserAgentOverride', {
            userAgent: await page.evaluate(() => navigator.userAgent),
            platform: 'Win32'
        });
    } catch (e) {}

    await client.send('Page.setWebLifecycleState', { state: 'active' });

    await page.evaluateOnNewDocument(`
        (() => {
            const webRTCPolicy = {
                'webRTCIPHandlingPolicy': 'disable_non_proxied_udp',
                'webRTCMultipleRoutesEnabled': false,
                'webRTCNonProxiedUdpEnabled': false
            };

            if (chrome && chrome.privacy && chrome.privacy.network) {
                try {
                    chrome.privacy.network.webRTCIPHandlingPolicy.set({
                        value: 'disable_non_proxied_udp'
                    });
                } catch (e) {}
            }
        })();
    `);

    await page.evaluateOnNewDocument(getWebRTCBlockScript);

    await page.evaluate(() => {
        const forceBlock = (obj, prop) => {
            try {
                delete obj[prop];
                Object.defineProperty(obj, prop, {
                    get: () => undefined,
                    set: () => {},
                    configurable: false,
                    enumerable: false,
                    writable: false
                });
            } catch (e) {}
        };

        ['RTCPeerConnection', 'webkitRTCPeerConnection', 'mozRTCPeerConnection', 'RTCDataChannel', 'RTCIceCandidate', 'RTCSessionDescription', 'MediaStream', 'MediaStreamTrack', 'MediaDevices'].forEach((api) => {
            forceBlock(window, api);
        });

        ['getUserMedia', 'webkitGetUserMedia', 'mozGetUserMedia', 'mediaDevices'].forEach((api) => {
            forceBlock(navigator, api);
        });

        if (window.navigator && window.navigator.getUserMedia) {
            window.navigator.getUserMedia = undefined;
        }
        if (window.navigator && window.navigator.mediaDevices) {
            window.navigator.mediaDevices = undefined;
        }
    });

    page.forceBlockWebRTC = async () => {
        await page.evaluate(getWebRTCBlockScript);
    };

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
