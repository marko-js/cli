'use strict';

const path = require('path');
const lasso = require('lasso');

module.exports = function run (options) {
    let { pages, config, flags } = options;

    if (config) {
        config = require(require.resolve(path.resolve(process.cwd(), config)));
    }

    const theLasso = lasso.create(config);
    const pageConfigs = pages.map((page) => {
        // TODO: Should we consider merging the dependencies if there are some
        // in the config file?
        return {
            flags,
            dependencies: [`marko-hydrate:${page}`],
            // TODO: This might be needed. We may also consider making this the same as pageDir (absolute path)
            // cacheKey: page,
            pageDir: path.resolve(process.cwd(), path.dirname(page)),
            pageName: page
        };
    });

    return theLasso.prebuildPage(pageConfigs);
};
