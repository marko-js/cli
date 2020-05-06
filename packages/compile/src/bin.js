#!/usr/bin/env node
const updateNotifier = require("update-notifier");
const { parse, run } = require("./cli");
updateNotifier(require("../package.json")).notify();
run(parse(process.argv.slice(2)));
