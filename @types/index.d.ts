import { Browser, LaunchOptions, Page, MouseClickOptions } from 'rebrowser-puppeteer';
import { PuppeteerExtra } from 'puppeteer-extra';

/**
 * keyboard type options
 */
export interface TypeOptions {
    /**
     * time to wait between key presses in milliseconds
     */
    delay?: number;
}

/**
 * proxy configuration
 */
export interface ProxyConfig {
    /**
     * proxy server address (e.g., http://proxy.example.com:8080)
     */
    server: string;
    /**
     * proxy username (if required)
     */
    username?: string;
    /**
     * proxy password (if required)
     */
    password?: string;
}

/**
 * extended launch options
 */
export interface GhostLaunchOptions extends LaunchOptions {
    /**
     * proxy configuration
     */
    proxy?: ProxyConfig;
}

/**
 * browser instance
 * @see [browser](https://pptr.dev/api/puppeteer.browser)
 */
export interface GhostBrowser extends Browser {
    /**
     * create new page with anti-detection
     * @see [puppeteer.browser.newpage](https://pptr.dev/api/puppeteer.browser.newpage)
     */
    newPage(): Promise<GhostPage>;
}

/**
 * page instance
 * @see [page](https://pptr.dev/api/puppeteer.page)
 */
export interface GhostPage extends Page {
    /**
     * click on element
     * @param selector - css selector to click
     * @param options - click options
     * @see [click-options](https://pptr.dev/api/puppeteer.mouseoptions)
     */
    click(selector: string, options?: MouseClickOptions): Promise<void>;
    /**
     * write text to input, textarea, etc.
     * @param selector - css selector to type into
     * @param text - text to type
     * @param options - type options
     */
    type(selector: string, text: string, options?: TypeOptions): Promise<void>;
}

/**
 * anti-detection puppeteer
 * @see [puppeteer-ghost](https://www.npmjs.com/package/puppeteer-ghost)
 */
export interface PuppeteerGhost {
    /**
     * start new browser with anti-detection
     * @param options - launch options
     * @see [puppeteer.launch](https://pptr.dev/api/puppeteer.launchoptions)
     */
    launch(options?: GhostLaunchOptions): Promise<GhostBrowser>;
}

/**
 * puppeteer-ghost - puppeteer library to bypass bot detection
 */
declare const puppeteer: PuppeteerGhost & Omit<PuppeteerExtra, 'launch'>;

export default puppeteer;
