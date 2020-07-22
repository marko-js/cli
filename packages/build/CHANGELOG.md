# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.0.0](https://github.com/marko-js/cli/compare/@marko/build@1.6.5...@marko/build@2.0.0) (2020-07-22)


### Features

* add support for custom webpack.config.js ([#170](https://github.com/marko-js/cli/issues/170)) ([d2eba70](https://github.com/marko-js/cli/commit/d2eba708d2923763582187f770dd4729df315357))
* exclude components directory from served pages ([#173](https://github.com/marko-js/cli/issues/173)) ([e4f0fb9](https://github.com/marko-js/cli/commit/e4f0fb9af7ad8ebcec05eb7ac353d4c092d0d20b))
* **build:** marko 5 support for src attributes transform ([34b9e76](https://github.com/marko-js/cli/commit/34b9e76d76aed6fc763ebea2829d27d308051849))


### BREAKING CHANGES

* This changes the programatic api for @marko/build
* **build:** resolving asset paths now use nodes resolution only





## [1.6.5](https://github.com/marko-js/cli/compare/@marko/build@1.6.4...@marko/build@1.6.5) (2020-07-13)


### Bug Fixes

* **build:** 404 when dev mode receives non dev server asset request ([4b0ac20](https://github.com/marko-js/cli/commit/4b0ac20cbddaa5843888298d82d90733eef05ad5))





## [1.6.4](https://github.com/marko-js/cli/compare/@marko/build@1.6.3...@marko/build@1.6.4) (2020-07-13)


### Bug Fixes

* **build:** path handling in windows ([4cc47ba](https://github.com/marko-js/cli/commit/4cc47ba2235e8a21f71df745e475a5fbca86e0dc))





## [1.6.3](https://github.com/marko-js/cli/compare/@marko/build@1.6.2...@marko/build@1.6.3) (2020-06-25)


### Bug Fixes

* add missing babel runtime dep ([9d04f7c](https://github.com/marko-js/cli/commit/9d04f7cbf4a21aabf01f4aac3aaf2c8a97d31253))





## [1.6.2](https://github.com/marko-js/cli/compare/@marko/build@1.6.1...@marko/build@1.6.2) (2020-05-27)


### Bug Fixes

* **build:** define BUNDLE env for browser compiler ([dec6fd7](https://github.com/marko-js/cli/commit/dec6fd7bc9eaee529ca0951b19cf670e5dbe1d86))





## [1.6.1](https://github.com/marko-js/cli/compare/@marko/build@1.6.0...@marko/build@1.6.1) (2020-05-27)


### Bug Fixes

* **build:** context path for windows when testing ([fe330ef](https://github.com/marko-js/cli/commit/fe330efa2320f9d0f8d267fcde4bc2aa7fb2ef0c))





# [1.6.0](https://github.com/marko-js/cli/compare/@marko/build@1.5.1...@marko/build@1.6.0) (2020-05-26)


### Features

* **build:** prefer using app dir as context ([bd16321](https://github.com/marko-js/cli/commit/bd1632190826e2556d914f412be7f9253e7e2ba5))





## [1.5.1](https://github.com/marko-js/cli/compare/@marko/build@1.5.0...@marko/build@1.5.1) (2020-05-20)


### Bug Fixes

* **build:** regression causing multiple copies of Marko in dev mode ([e227932](https://github.com/marko-js/cli/commit/e227932b734bd56bf318d3fbe3be6a491db07d88))





# [1.5.0](https://github.com/marko-js/cli/compare/@marko/build@1.4.1...@marko/build@1.5.0) (2020-05-19)


### Features

* **build:** marko 5 support ([903997b](https://github.com/marko-js/cli/commit/903997b37ee06fdfbf92c8f13559f3f1fe0e3416))





## [1.4.1](https://github.com/marko-js/cli/compare/@marko/build@1.4.0...@marko/build@1.4.1) (2020-05-18)


### Bug Fixes

* **build:** allow server bundle to be cached ([#165](https://github.com/marko-js/cli/issues/165)) ([513b5a8](https://github.com/marko-js/cli/commit/513b5a83cab57e876d85fa30c29575289f92aa53))
* **build:** server bundle source maps in dev mode ([#167](https://github.com/marko-js/cli/issues/167)) ([12355c3](https://github.com/marko-js/cli/commit/12355c3006ad8ffe812c4d0f270f3f4191388e64))





# [1.4.0](https://github.com/marko-js/cli/compare/@marko/build@1.3.3...@marko/build@1.4.0) (2020-05-18)


### Bug Fixes

* **build:** asset cache header now set to 1 year ([#164](https://github.com/marko-js/cli/issues/164)) ([a2442ab](https://github.com/marko-js/cli/commit/a2442ab07fd09dae9ce687413a5c5f031dcbbfbc))
* **build:** remove bail option which was causing errors to be hidden ([#163](https://github.com/marko-js/cli/issues/163)) ([c8d7812](https://github.com/marko-js/cli/commit/c8d781287cd699963b63cb65d4075834b6fd23e7))


### Features

* **build:** shorten generated filenames for prod build ([#162](https://github.com/marko-js/cli/issues/162)) ([0c22489](https://github.com/marko-js/cli/commit/0c224897bbbfc3a12561da5ac3961c7368b3c93a))





## [1.3.3](https://github.com/marko-js/cli/compare/@marko/build@1.3.2...@marko/build@1.3.3) (2020-05-12)


### Bug Fixes

* include version flag for all commands ([802de9d](https://github.com/marko-js/cli/commit/802de9daa9e70b2912b5a718352f667d7bc2eb03))





## [1.3.2](https://github.com/marko-js/cli/compare/@marko/build@1.3.1...@marko/build@1.3.2) (2020-05-08)


### Bug Fixes

* issue with adding a new route in serve ([#159](https://github.com/marko-js/cli/issues/159)) ([0b7195f](https://github.com/marko-js/cli/commit/0b7195fba89bd3e29cc30dad907b11e10fef054c))





## [1.3.1](https://github.com/marko-js/cli/compare/@marko/build@1.3.0...@marko/build@1.3.1) (2020-05-08)

**Note:** Version bump only for package @marko/build





# [1.3.0](https://github.com/marko-js/cli/compare/@marko/build@1.2.0...@marko/build@1.3.0) (2020-05-07)


### Features

* allow commands to run apart from marko-cli ([#152](https://github.com/marko-js/cli/issues/152)) ([4226988](https://github.com/marko-js/cli/commit/42269889bdf89e3811e465852ad0061e8e06cd03))





# [1.2.0](https://github.com/marko-js/cli/compare/@marko/build@1.1.1...@marko/build@1.2.0) (2019-10-16)


### Features

* **build:** automatically remove old assets ([85e5a6a](https://github.com/marko-js/cli/commit/85e5a6a))





## [1.1.1](https://github.com/marko-js/cli/compare/@marko/build@1.1.0...@marko/build@1.1.1) (2019-10-16)


### Bug Fixes

* **build:** ensure marko webpack taglib is loaded ([534c62a](https://github.com/marko-js/cli/commit/534c62a))





# [1.1.0](https://github.com/marko-js/cli/compare/@marko/build@1.0.7...@marko/build@1.1.0) (2019-10-16)


### Features

* **build:** support top level index folder ([886cdb2](https://github.com/marko-js/cli/commit/886cdb2))





## [1.0.7](https://github.com/marko-js/cli/compare/@marko/build@1.0.6...@marko/build@1.0.7) (2019-10-16)


### Bug Fixes

* **build:** improve css handling ([1c65b35](https://github.com/marko-js/cli/commit/1c65b35))





## [1.0.6](https://github.com/marko-js/cli/compare/@marko/build@1.0.5...@marko/build@1.0.6) (2019-09-19)


### Bug Fixes

* **build:** no longer use absolute path for assets ([f7372b3](https://github.com/marko-js/cli/commit/f7372b3))





## [1.0.5](https://github.com/marko-js/cli/compare/@marko/build@1.0.4...@marko/build@1.0.5) (2019-09-19)

**Note:** Version bump only for package @marko/build





## [1.0.4](https://github.com/marko-js/cli/compare/@marko/build@1.0.3...@marko/build@1.0.4) (2019-09-19)


### Bug Fixes

* **test:** issue with cleanup not happending, upgrade chromedriver ([5c47e7a](https://github.com/marko-js/cli/commit/5c47e7a))





## [1.0.3](https://github.com/marko-js/cli/compare/@marko/build@1.0.2...@marko/build@1.0.3) (2019-07-12)

**Note:** Version bump only for package @marko/build





## [1.0.2](https://github.com/marko-js/cli/compare/@marko/build@1.0.1...@marko/build@1.0.2) (2019-07-12)

**Note:** Version bump only for package @marko/build





## 1.0.1 (2019-07-11)

**Note:** Version bump only for package @marko/build
