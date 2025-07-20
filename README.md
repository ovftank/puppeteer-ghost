# 👻 Puppeteer Ghost

[![npm](https://img.shields.io/npm/v/puppeteer-ghost/latest)](https://www.npmjs.com/package/puppeteer-ghost)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/ovftank/puppeteer-ghost)

- Bypass CDP, Proxy, webdriver detection
- Blocks WebRTC to prevent IP leaks
- Works exactly like regular Puppeteer - just import and use
- Supports proxy configuration with authentication

## Installation

```bash
pnpm add puppeteer-ghost
# or
npm install puppeteer-ghost
# or
yarn add puppeteer-ghost
```

## Quick Start

```js
import puppeteer from 'puppeteer-ghost';

// Launch with optimized defaults - no configuration needed
const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.goto('https://www.browserscan.net/');
```

**Default Configuration:**

- `headless: false` - Browser window is visible by default
- `defaultViewport: null` - Uses full browser window size
- Anti-detection features automatically enabled
- Single tab behavior (no duplicate tabs)

## Configuration

### Custom Launch Options

```js
/**
 * @type {import('puppeteer-ghost').GhostLaunchOptions}
 */
const launchOptions = {
  headless: true,                     // Run in headless mode
  args: ['--window-size=1920,1080'],  // Custom browser arguments
};

const browser = await puppeteer.launch(launchOptions);
```

**Advanced Configuration:**

```js
/**
 * @type {import('puppeteer-ghost').GhostLaunchOptions}
 */
const advancedOptions = {
  headless: false,
  defaultViewport: { width: 1920, height: 1080 },
  args: [
    '--disable-web-security',
    '--disable-features=VizDisplayCompositor'
  ],
  proxy: {
    server: 'http://proxy.example.com:8080',
    username: 'user',
    password: 'pass'
  }
};
```

### Proxy Configuration

```js
/**
 * @type {import('puppeteer-ghost').ProxyConfig}
 */
const proxyConfig = {
  server: 'http://proxy.example.com:8080',
  username: 'your-username', // optional
  password: 'your-password'  // optional
};

const browser = await puppeteer.launch({
  proxy: proxyConfig
});

const page = await browser.newPage();
await page.goto('https://www.browserscan.net');
```

## API Reference

### Core API

#### `puppeteer.launch(options?)`

Launches a new browser instance with built-in anti-detection capabilities.

```js
/**
 * @param {GhostLaunchOptions} [options] - Launch configuration
 * @returns {Promise<GhostBrowser>} Enhanced browser instance
 */
const browser = await puppeteer.launch(options);
```

**Example:**

```js
const browser = await puppeteer.launch({
  headless: false,
  proxy: {
    server: 'http://proxy.example.com:8080',
    username: 'user',
    password: 'pass'
  }
});
```

### Type Definitions

#### `GhostLaunchOptions`

Extends Puppeteer's `LaunchOptions` with additional anti-detection properties:

```typescript
interface GhostLaunchOptions extends LaunchOptions {
  /** Proxy configuration for routing traffic */
  proxy?: ProxyConfig;
}
```

#### `ProxyConfig`

Configuration object for proxy settings:

```typescript
interface ProxyConfig {
  /** Proxy server URL (http://host:port, https://host:port, socks5://host:port) */
  server: string;
  /** Authentication username (optional) */
  username?: string;
  /** Authentication password (optional) */
  password?: string;
}
```

#### `GhostBrowser`

Enhanced browser instance with anti-detection features:

```typescript
interface GhostBrowser extends Browser {
  /** Creates a new page with anti-detection enabled */
  newPage(): Promise<GhostPage>;
}
```

#### `GhostPage`

Enhanced page instance with human-like interactions:

```typescript
interface GhostPage extends Page {
  /** Click with randomized positioning and timing */
  click(selector: string, options?: MouseClickOptions): Promise<void>;
  /** Type with human-like delays between keystrokes */
  type(selector: string, text: string, options?: TypeOptions): Promise<void>;
}
```

#### `TypeOptions`

Options for the enhanced type method:

```typescript
interface TypeOptions {
  /** Delay between keystrokes in milliseconds (default: random 10-50ms) */
  delay?: number;
}
```

### Enhanced Methods

#### `browser.newPage()`

Creates a new page with anti-detection features automatically enabled.

```js
/**
 * @returns {Promise<GhostPage>} Enhanced page instance
 */
const page = await browser.newPage();
```

**Features enabled:**

- WebRTC blocking to prevent IP leaks
- Proxy authentication (if configured)
- Human-like interaction methods

#### `page.click(selector, options?)`

Clicks on an element with human-like behavior including randomized positioning and timing delays.

```js
/**
 * @param {string} selector - CSS selector to click
 * @param {MouseClickOptions} [options] - Click options
 * @returns {Promise<void>}
 */
await page.click('#submit-button', { button: 'left' });
```

#### `page.type(selector, text, options?)`

Types text into an element with human-like delays between keystrokes.

```js
/**
 * @param {string} selector - CSS selector to type into
 * @param {string} text - Text to type
 * @param {TypeOptions} [options] - Typing options
 * @returns {Promise<void>}
 */
await page.type('#username', 'myusername', { delay: 100 });
```

## License

[ISC License](LICENSE) - see the [LICENSE](LICENSE) file for details.

## Issues

Found a bug? [Open an issue](https://github.com/ovftank/puppeteer-ghost/issues) or start a [discussion](https://github.com/ovftank/puppeteer-ghost/discussions).
