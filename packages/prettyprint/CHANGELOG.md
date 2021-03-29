# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [3.0.1](https://github.com/marko-js/cli/compare/@marko/prettyprint@3.0.0...@marko/prettyprint@3.0.1) (2021-03-29)


### Bug Fixes

* lint errors ([57e87fc](https://github.com/marko-js/cli/commit/57e87fc0027096c8648ac5645db66c0c22889b40))





# [3.0.0](https://github.com/marko-js/cli/compare/@marko/prettyprint@2.2.3...@marko/prettyprint@3.0.0) (2021-02-04)


### Features

* update deps, support Marko 5 ([c5d34ff](https://github.com/marko-js/cli/commit/c5d34ff58fa34ef545330dfe1231ebac37282895))


### BREAKING CHANGES

* Marko 4 support dropped in serve/build
* Upgraded webdriver version for test





## [2.2.3](https://github.com/marko-js/cli/compare/@marko/prettyprint@2.2.2...@marko/prettyprint@2.2.3) (2020-07-27)


### Bug Fixes

* **prettyprint:** ensure supported copy of Marko is used ([c9120d2](https://github.com/marko-js/cli/commit/c9120d2d1be35ac0808168b35109f3637b9703d7))





## [2.2.2](https://github.com/marko-js/cli/compare/@marko/prettyprint@2.2.1...@marko/prettyprint@2.2.2) (2020-06-25)


### Bug Fixes

* add missing babel runtime dep ([9d04f7c](https://github.com/marko-js/cli/commit/9d04f7cbf4a21aabf01f4aac3aaf2c8a97d31253))





## [2.2.1](https://github.com/marko-js/cli/compare/@marko/prettyprint@2.2.0...@marko/prettyprint@2.2.1) (2020-05-12)


### Bug Fixes

* include version flag for all commands ([802de9d](https://github.com/marko-js/cli/commit/802de9daa9e70b2912b5a718352f667d7bc2eb03))





# [2.2.0](https://github.com/marko-js/cli/compare/@marko/prettyprint@2.1.2...@marko/prettyprint@2.2.0) (2020-05-07)


### Bug Fixes

* **test:** issue with cleanup not happending, upgrade chromedriver ([5c47e7a](https://github.com/marko-js/cli/commit/5c47e7a05a93c6876c12d3db12641ca68dc0b719))


### Features

* allow commands to run apart from marko-cli ([#152](https://github.com/marko-js/cli/issues/152)) ([4226988](https://github.com/marko-js/cli/commit/42269889bdf89e3811e465852ad0061e8e06cd03))





## [2.1.2](https://github.com/marko-js/cli/compare/@marko/prettyprint@2.1.1...@marko/prettyprint@2.1.2) (2019-07-12)

**Note:** Version bump only for package @marko/prettyprint





## [2.1.1](https://github.com/marko-js/cli/compare/@marko/prettyprint@2.1.0...@marko/prettyprint@2.1.1) (2019-07-12)

**Note:** Version bump only for package @marko/prettyprint





# [2.1.0](https://github.com/marko-js/cli/compare/@marko/prettyprint@2.0.5...@marko/prettyprint@2.1.0) (2019-07-11)


### Features

* **test:** upgrade wdio ([#130](https://github.com/marko-js/cli/issues/130)) ([ffbdefd](https://github.com/marko-js/cli/commit/ffbdefd))





## [2.0.5](https://github.com/marko-js/cli/compare/@marko/prettyprint@2.0.4...@marko/prettyprint@2.0.5) (2019-04-17)


### Bug Fixes

* **prettyprint:** cli aggregates errors and visually shows changed paths ([#127](https://github.com/marko-js/cli/issues/127)) ([e012a4e](https://github.com/marko-js/cli/commit/e012a4e))





## [2.0.4](https://github.com/marko-js/cli/compare/@marko/prettyprint@2.0.3...@marko/prettyprint@2.0.4) (2019-03-21)


### Bug Fixes

* **prettyprint:** improve whitespace preservation ([#125](https://github.com/marko-js/cli/issues/125)) ([8c1b256](https://github.com/marko-js/cli/commit/8c1b256))





## [2.0.3](https://github.com/marko-js/cli/compare/@marko/prettyprint@2.0.2...@marko/prettyprint@2.0.3) (2019-02-25)


### Bug Fixes

* **prettyprint:** printing expressions with uneven parens ([#121](https://github.com/marko-js/cli/issues/121)) ([64f919d](https://github.com/marko-js/cli/commit/64f919d))





## [2.0.2](https://github.com/marko-js/cli/compare/@marko/prettyprint@2.0.1...@marko/prettyprint@2.0.2) (2019-01-30)


### Bug Fixes

* **prettyprint:** improve printing of nested attributes ([#118](https://github.com/marko-js/cli/issues/118)) ([a4d6c05](https://github.com/marko-js/cli/commit/a4d6c05))





## [2.0.1](https://github.com/marko-js/cli/compare/@marko/prettyprint@2.0.0...@marko/prettyprint@2.0.1) (2019-01-23)


### Bug Fixes

* **prettyprint:** attribute with multiple lines ([#117](https://github.com/marko-js/cli/issues/117)) ([399c53a](https://github.com/marko-js/cli/commit/399c53a))





# [2.0.0](https://github.com/marko-js/cli/compare/@marko/prettyprint@1.4.1...@marko/prettyprint@2.0.0) (2019-01-23)


### Features

* **prettyprint:** remove unneeded parens (attrs) & blocks (scriptlets) ([#116](https://github.com/marko-js/cli/issues/116)) ([c00d7c5](https://github.com/marko-js/cli/commit/c00d7c5))


### BREAKING CHANGES

* **prettyprint:** RegExp are now parsed and unwrapped - requires marko@>=4.14.21





<a name="1.4.1"></a>
## [1.4.1](https://github.com/marko-js/cli/compare/@marko/prettyprint@1.4.0...@marko/prettyprint@1.4.1) (2019-01-18)


### Bug Fixes

* **prettyprint:** support printing ast nodes as scriptlet values ([#115](https://github.com/marko-js/cli/issues/115)) ([ef92828](https://github.com/marko-js/cli/commit/ef92828))




<a name="1.4.0"></a>
# [1.4.0](https://github.com/marko-js/cli/compare/@marko/prettyprint@1.3.0...@marko/prettyprint@1.4.0) (2019-01-17)


### Bug Fixes

* downgrade lerna ([0420d62](https://github.com/marko-js/cli/commit/0420d62))


### Features

* **prettyprint:** support for modern tag params ([#114](https://github.com/marko-js/cli/issues/114)) ([6900fa5](https://github.com/marko-js/cli/commit/6900fa5))




# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [1.3.0](https://github.com/marko-js/cli/compare/@marko/prettyprint@1.2.0...@marko/prettyprint@1.3.0) (2019-01-03)


### Features

* add migrator for file names ([#104](https://github.com/marko-js/cli/issues/104)) ([8eddfa6](https://github.com/marko-js/cli/commit/8eddfa6))





# [1.2.0](https://github.com/marko-js/cli/compare/@marko/prettyprint@1.1.3...@marko/prettyprint@1.2.0) (2018-12-12)


### Bug Fixes

* dedupe package.json deps when hoisting ([dcf9eac](https://github.com/marko-js/cli/commit/dcf9eac))


### Features

* **migrate:** expose optional migration api in migrate command ([#100](https://github.com/marko-js/cli/issues/100)) ([4c9febc](https://github.com/marko-js/cli/commit/4c9febc))





## [1.1.3](https://github.com/marko-js/cli/compare/@marko/prettyprint@1.1.2...@marko/prettyprint@1.1.3) (2018-12-07)


### Bug Fixes

* **cli:** add missing dependency ([d77cb5f](https://github.com/marko-js/cli/commit/d77cb5f))





## [1.1.2](https://github.com/marko-js/cli/compare/@marko/prettyprint@1.1.0...@marko/prettyprint@1.1.2) (2018-12-05)

**Note:** Version bump only for package @marko/prettyprint





## [1.1.1](https://github.com/marko-js/cli/compare/@marko/prettyprint@1.1.0...@marko/prettyprint@1.1.1) (2018-12-05)

**Note:** Version bump only for package @marko/prettyprint





# 1.1.0 (2018-12-05)


### Features

* add prettyprint package ([158ec29](https://github.com/marko-js/cli/commit/158ec29))
