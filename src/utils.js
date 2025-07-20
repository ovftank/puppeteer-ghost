/**
 * @fileoverview utility functions
 * @author ovftank
 */

import { CHROME_PATHS } from './config.js';

/**
 * find chrome executable path
 * @returns {Promise<string|null>} path to chrome or null if not found
 */
export const findChromePath = async () => {
    for (const path of CHROME_PATHS) {
        try {
            await import('fs').then((fs) => fs.promises.access(path));
            return path;
        } catch {}
    }
    return null;
};

/**
 * process proxy configuration
 * @param {import('../types/index.js').ProxyConfig} proxy - proxy config
 * @returns {{server: string, auth: {username: string, password: string}|null}}
 */
export const processProxyConfig = (proxy) => {
    if (!proxy?.server) return null;

    const server = proxy.server.replace('http://', '').replace('https://', '');
    const auth = proxy.username && proxy.password ? { username: proxy.username, password: proxy.password } : null;

    return { server, auth };
};

/**
 * @param {number} min - minimum delay in ms
 * @param {number} max - maximum delay in ms
 * @returns {number} random delay
 */
export const randomDelay = (min, max) => {
    return min + Math.random() * (max - min);
};

/**
 * @param {Object} box - element bounding box
 * @returns {{x: number, y: number}} random position
 */
export const randomPosition = (box) => {
    const x = box.x + box.width * (0.3 + Math.random() * 0.4);
    const y = box.y + box.height * (0.3 + Math.random() * 0.4);
    return { x, y };
};

/**
 * @param {number} ms - milliseconds to sleep
 * @returns {Promise<void>}
 */
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
