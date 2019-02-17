const serve = require("../src/index");

serve({ file: require.resolve("./test.marko"), port: 3000 });
