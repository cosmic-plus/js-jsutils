# @cosmic-plus/jsutils

Generic JavaScript utilities that are not related to Stellar.

_Note:_ This is an internal library and may be modified in
compatibility-breaking ways.

## Install

- **Npm** `npm install @cosmic-plus/jsutils`
- **Yarn** `yarn add @cosmic-plus/jsutils`

Then: `const { $module, ... } = require("@cosmic-plus/jsutils")`

To pick a module: `const $module = require("@cosmic-plus/jsutils/es5/$module")`

## Modules

- **dom**: Easy access to DOM tree elements (_browser-only_).
- **env**: Check whether we are into a Node.js or browser environment.
- **file**: Load/save file (_browser-only_).
- **form**: A class to ease form creation (_browser-only_).
- **gui**: A light component-driven development solution (_browser-only_).
- **html**: A few methods to deal with HTML elements (_browser-only_).
- **load**: Asynchronously load CSS (_browser-only_).
- **mirrorable**: Subscribable Arrays.
- **misc**: Various unrelated methods.
- **nice**: Nicely format numbers.
- **observable**: Add event support to _Object_.
- **projectable**: Self-updatable Object properties.
- **page**: Tab-based browsing (_browser-only_).
- **params**: An Object that reflect query string parameters (_browser-only_).
- **polyfill**: A few important polyfill (_browser-only_).
- **service-worker**: Easy way to setup a service worker (_browser-only_).
- **tabs**: A simple tabbed view generator (_browser_only_).

## Additional Resources

- GitHub repository: https://github.com/cosmic-plus/node-jsutils
- NPM package: https://npmjs.com/@cosmic-plus/jsutils
- Yarn package: https://yarn.pm/@cosmic-plus/jsutils
