import { Browser, LaunchOptions, Page, MouseClickOptions, TypeOptions } from 'rebrowser-puppeteer';
import { PuppeteerExtra } from 'puppeteer-extra';

/**
 * browser instance
 * @see [browser](https://pptr.dev/api/puppeteer.browser)
 */
interface GhostBrowser extends Browser {
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
interface GhostPage extends Page {
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
     * @see [type-options](https://pptr.dev/api/puppeteer.keyboardtypeoptions)
     */
    type(selector: string, text: string, options?: TypeOptions): Promise<void>;
}

/**
 * anti-detection puppeteer
 * @see [puppeteer-ghost](https://www.npmjs.com/package/puppeteer-ghost)
 */
interface PuppeteerGhost extends PuppeteerExtra {
    /**
     * start new browser with anti-detection
     * @param options - launch options
     * @see [puppeteer.launch](https://pptr.dev/api/puppeteer.launchoptions)
     */
    launch(options?: LaunchOptions): Promise<GhostBrowser>;
}

/**
 * puppeteer-ghost - puppeteer library to bypass bot detection
 */
declare const puppeteer: PuppeteerGhost;

export default puppeteer;
