require('require-self-ref');

const test = require('ava');
const hasMarkoCliInstalled = require('./hasMarkoCliInstalled');

test('hasMarkoCliInstalled: project.json with marko-cli as dev dependency', (t) => {
  t.is(hasMarkoCliInstalled({
    'devDependencies': {
      'marko-cli': '^1.0.0'
    }
  }), true);
});

test('hasMarkoCliInstalled: project.json with marko-cli as prod dependency', (t) => {
  t.is(hasMarkoCliInstalled({
    'dependencies': {
      'marko-cli': '^1.0.0'
    }
  }), true);
});

test('hasMarkoCliInstalled: project.json without marko-cli', (t) => {
  t.is(hasMarkoCliInstalled({
    'dependencies': {}
  }), false);
});

test('hasMarkoCliInstalled: empty project.json without marko-cli', (t) => {
  t.is(hasMarkoCliInstalled({}), false);
});
