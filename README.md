# 👻 Puppeteer Ghost

[![npm](https://img.shields.io/npm/v/puppeteer-ghost/latest)](https://www.npmjs.com/package/puppeteer-ghost)

- Bypass CDP, Proxy, webdriver detection
- Blocks WebRTC to prevent IP leaks
- Works exactly like regular Puppeteer - just import and go

## 📦 Installation

```bash
npm install puppeteer-ghost
# or
pnpm add puppeteer-ghost
# or
yarn add puppeteer-ghost
```

## Quick Start

```js
import puppeteer from 'puppeteer-ghost';

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.goto('https://www.browserscan.net/')
```

## Custom options

```js
const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--window-size=1920,1080'],
  executablePath: '/path/to/chrome'
});
```

## Built with

- [rebrowser-puppeteer](https://github.com/rebrowser/rebrowser-puppeteer) - Better Puppeteer fork
- [puppeteer-extra](https://github.com/berstend/puppeteer-extra) - Plugin system
- [puppeteer-extra-plugin-stealth](https://github.com/berstend/puppeteer-extra/tree/master/packages/puppeteer-extra-plugin-stealth) - Stealth mode

## License

[ISC License](LICENSE) - see the [LICENSE](LICENSE) file for details.

## Issues

Found a bug? [Open an issue](https://github.com/ovftank/puppeteer-ghost/issues).
