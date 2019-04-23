# Changelog

All notable changes to this project will be documented in this file.

## Unreleased

### Breaking

- Move code to `./src`.
- Split package in two (`@cosmic-plus/jsutils` & `@cosmic-plus/domutils`).

### Added

- Bundle transpiled ES5 code within the package.
- Enable tree shaking for Webpack & Parcel (Rollup needs some additional work).

## 1.15.0 - 2019-04-12

### Added

- gui.js: Support for escape sequence (\%...).
- projectable.js: Add methods untrap() and watch().

### Changed

- Projectable.destroy() has been moved to Observable.destroy().
- projectable.js: Change trap() parameters.
- projectable.js: Rename outdated property event from 'compute:{property}' to
  'outdate:{property}'.
- mirrorable.js: Make event triggering order consistent.

### Removed

- projectable.js: link(), project() and define() no longer accept 'skip'
  parameter.

### Fixed

- mirrorable.js: destroy() method now trigger events as expected.

## 1.14.7 - 2019-03-14

### Changed

- form.js: Add a spinner to form info.

## 1.14.6 - 2019-03-05

### Changed

- tabs.js: Support for hidden content.

## 1.14.5 - 2019-02-17

### Fixed

- gui.js: Fix HTML events support on Firefox.

## 1.14.4 - 2019-02-17

### Fixed

- projectable.js: make define() compatible with minification.

## 1.14.3 - 2019-02-16

### Fixed

- mirrorable.js: Revert an unintended change.

## 1.14.2 - 2019-02-16

### Added

- projectable.js: Add set() method.
- misc.js: Add day() method.
- mirrorable.js: Implement events adding/removal.

### Changed

- tabs.js: Allow tab content to be a generator function.

## 1.14.1 - 2019-02-14

### Changed

- tabs.js: add classNames to components.

### Fixed

- gui.js: Tiny ellipsis fix.
- gui.js: Several tiny fixes.
- mirrorable.js: Fix cases were Mirrorables were not properly initiated.

## 1.14.0 - 2019-02-04

### Added

- Add 'params.js' module.
- Add 'tabs.js' module.
- Add 'mirrorable.js' module.
- Add 'gui.js' module.
- load.js: add load.js().
- polyfill.js: add Object.entries.

### Fixed

- Fix a regression introduced when linting.

## 1.13.0 - 2019-02-01

### Added

- Add 'observable.js' module.
- Add 'projectable.js' module.
- nice.js: New function parameters (min, max, significant).

## 1.12.0 - 2019-01-17

### Added

- form.js: Add click-jacking protection.
- html.js: Add convert().
- env.js: Add env.isEmbedded.

### Changed

- Rename html.appendClass() into html.addClass().
- Move misc.copy() to html.copyString().

### Fixed

- nice.js: Various bugfixes.

## Older Releases

There is no changelog for older releases. Please take a look at [commit
history](https://github.com/cosmic-plus/node-ledger-wallet/commits/master).
