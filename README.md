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
