#!/usr/bin/env node
const updateNotifier = require("update-notifier");
const { parse, run } = require("./cli");
updateNotifier({ pkg: require("../package.json") }).notify();
run(parse(process.argv.slice(2)));
