# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [6.0.13](https://github.com/marko-js/cli/compare/@marko/test@6.0.12...@marko/test@6.0.13) (2019-08-26)


### Bug Fixes

* **test:** skip build meta data for chromedriver ([212272d](https://github.com/marko-js/cli/commit/212272d))





## [6.0.12](https://github.com/marko-js/cli/compare/@marko/test@6.0.11...@marko/test@6.0.12) (2019-08-19)


### Bug Fixes

* **test:** improve error handling outside of test suite ([272c34a](https://github.com/marko-js/cli/commit/272c34a))





## [6.0.11](https://github.com/marko-js/cli/compare/@marko/test@6.0.10...@marko/test@6.0.11) (2019-07-31)


### Bug Fixes

* **test:** update chrome options ([2b1af61](https://github.com/marko-js/cli/commit/2b1af61))





## [6.0.10](https://github.com/marko-js/cli/compare/@marko/test@6.0.9...@marko/test@6.0.10) (2019-07-30)


### Bug Fixes

* **test:** issue with cleanup not happending, upgrade chromedriver ([5c47e7a](https://github.com/marko-js/cli/commit/5c47e7a))





## [6.0.9](https://github.com/marko-js/cli/compare/@marko/test@6.0.8...@marko/test@6.0.9) (2019-07-12)

**Note:** Version bump only for package @marko/test





## [6.0.8](https://github.com/marko-js/cli/compare/@marko/test@6.0.7...@marko/test@6.0.8) (2019-07-12)

**Note:** Version bump only for package @marko/test





## [6.0.7](https://github.com/marko-js/cli/compare/@marko/test@6.0.6...@marko/test@6.0.7) (2019-07-11)

**Note:** Version bump only for package @marko/test





## [6.0.6](https://github.com/marko-js/cli/compare/@marko/test@6.0.5...@marko/test@6.0.6) (2019-06-27)


### Bug Fixes

* **test:** err.stack not always available in IE11 ([4a6d07e](https://github.com/marko-js/cli/commit/4a6d07e))





## [6.0.5](https://github.com/marko-js/cli/compare/@marko/test@6.0.4...@marko/test@6.0.5) (2019-06-27)


### Bug Fixes

* **test:** downgrade strip-ansi for improved browser support ([5a3f483](https://github.com/marko-js/cli/commit/5a3f483))





## [6.0.4](https://github.com/marko-js/cli/compare/@marko/test@6.0.3...@marko/test@6.0.4) (2019-06-27)


### Bug Fixes

* **test:** improve stack traces in browser tests ([a218ff2](https://github.com/marko-js/cli/commit/a218ff2))





## [6.0.3](https://github.com/marko-js/cli/compare/@marko/test@6.0.2...@marko/test@6.0.3) (2019-06-27)


### Bug Fixes

* **test:** no longer error after tests in some cases ([1849f9a](https://github.com/marko-js/cli/commit/1849f9a))





## [6.0.2](https://github.com/marko-js/cli/compare/@marko/test@6.0.1...@marko/test@6.0.2) (2019-06-26)


### Bug Fixes

* **test:** try to resize browsers multiple times ([ea1533a](https://github.com/marko-js/cli/commit/ea1533a))





## [6.0.1](https://github.com/marko-js/cli/compare/@marko/test@6.0.0...@marko/test@6.0.1) (2019-05-17)


### Bug Fixes

* **test:** resize based on viewport instead of window ([a58fdea](https://github.com/marko-js/cli/commit/a58fdea))





# [6.0.0](https://github.com/marko-js/cli/compare/@marko/test@5.1.1...@marko/test@6.0.0) (2019-05-16)


### Features

* **test:** upgrade wdio ([#130](https://github.com/marko-js/cli/issues/130)) ([ffbdefd](https://github.com/marko-js/cli/commit/ffbdefd))





## [5.1.1](https://github.com/marko-js/cli/compare/@marko/test@5.1.0...@marko/test@5.1.1) (2019-03-20)


### Bug Fixes

* **test:** remove deprecated inline control flow from test runner ([39c7a1d](https://github.com/marko-js/cli/commit/39c7a1d))





# [5.1.0](https://github.com/marko-js/cli/compare/@marko/test@5.0.0...@marko/test@5.1.0) (2019-02-07)


### Features

* **test:** add renderAsync method to server context ([#119](https://github.com/marko-js/cli/issues/119)) ([f67224c](https://github.com/marko-js/cli/commit/f67224c))





<a name="5.0.0"></a>
# [5.0.0](https://github.com/marko-js/cli/compare/@marko/test@4.1.1...@marko/test@5.0.0) (2019-01-17)


### Features

* **migrate:** Expose dependent path migration ([#110](https://github.com/marko-js/cli/issues/110)) ([9000add](https://github.com/marko-js/cli/commit/9000add))
* **prettyprint:** support for modern tag params ([#114](https://github.com/marko-js/cli/issues/114)) ([6900fa5](https://github.com/marko-js/cli/commit/6900fa5))


### BREAKING CHANGES

* **migrate:** rename result properties, default path migrations




# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [4.1.1](https://github.com/marko-js/cli/compare/@marko/test@4.1.0...@marko/test@4.1.1) (2018-12-18)


### Bug Fixes

* **test:** ensure errors displayed on older versions of Marko ([#105](https://github.com/marko-js/cli/issues/105)) ([c54a1be](https://github.com/marko-js/cli/commit/c54a1be))





# [4.1.0](https://github.com/marko-js/cli/compare/@marko/test@4.0.8...@marko/test@4.1.0) (2018-12-13)


### Bug Fixes

* dedupe package.json deps when hoisting ([dcf9eac](https://github.com/marko-js/cli/commit/dcf9eac))
* **test:** less strict semver range for marko version ([4c935d7](https://github.com/marko-js/cli/commit/4c935d7))


### Features

* add prettyprint package ([158ec29](https://github.com/marko-js/cli/commit/158ec29))
* **migrate:** expose optional migration api in migrate command ([#100](https://github.com/marko-js/cli/issues/100)) ([4c9febc](https://github.com/marko-js/cli/commit/4c9febc))





## 4.0.8 (2018-12-05)



## 4.0.7 (2018-11-16)


### Bug Fixes

* **test:** upgrade lasso-istanbul-instrument-transform and unpin it ([70c9a45](https://github.com/marko-js/cli/commit/70c9a45))



## 4.0.6 (2018-11-07)



## 4.0.4 (2018-08-18)



## 4.0.3 (2018-08-18)



## 4.0.2 (2018-08-17)


### Bug Fixes

* **test:** pass node args even when mocha options not set ([abd36cf](https://github.com/marko-js/cli/commit/abd36cf))



## 4.0.1 (2018-08-08)



# 4.0.0 (2018-08-08)



## 3.2.1 (2018-07-18)



# 3.2.0 (2018-07-18)



## 3.1.6 (2018-06-21)



## 3.1.5 (2018-06-21)



## 3.1.4 (2018-06-04)



## 3.1.3 (2018-05-24)



## 3.1.2 (2018-05-02)



## 3.1.1 (2018-05-02)



# 3.1.0 (2018-05-01)



## 3.0.1 (2018-04-27)



# 3.0.0 (2018-04-27)
