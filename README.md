# @cosmic-plus/jsutils

![Licence](https://img.shields.io/github/license/cosmic-plus/js-jsutils.svg)
[![Dependencies](https://david-dm.org/cosmic-plus/js-jsutils/status.svg)](https://david-dm.org/cosmic-plus/js-jsutils)
![Vulnerabilities](https://img.shields.io/snyk/vulnerabilities/npm/@cosmic-plus/jsutils.svg)
![Size](https://img.shields.io/bundlephobia/minzip/@cosmic-plus/jsutils.svg)
![Downloads](https://img.shields.io/npm/dt/@cosmic-plus/jsutils.svg)

Generic JavaScript utilities that are not related to Stellar.

_Note:_ This is an internal library and may be modified in
compatibility-breaking ways.

## Install

- **Npm** `npm install @cosmic-plus/jsutils`
- **Yarn** `yarn add @cosmic-plus/jsutils`

Then: `const { $module, ... } = require("@cosmic-plus/jsutils")`

To pick a module: `const $module = require("@cosmic-plus/jsutils/es5/$module")`

## Modules

- **env**: Check whether we are into a Node.js or browser environment.
- **mirrorable**: Subscribable Arrays.
- **misc**: Various unrelated methods.
- **nice**: Nicely format numbers.
- **observable**: Add event support to _Object_.
- **projectable**: Self-updatable Object properties.

## Additional Resources

- GitHub repository: https://github.com/cosmic-plus/node-jsutils
- NPM package: https://npmjs.com/@cosmic-plus/jsutils
- Yarn package: https://yarn.pm/@cosmic-plus/jsutils
