const fs = require("fs");
const nodePath = require("path");
const Minimatch = require("minimatch").Minimatch;
const markoPrettyprint = require("./");
const cwd = process.cwd();
const mmOptions = {
  matchBase: true,
  dot: true,
  flipNegate: true
};

exports.parse = function parse(argv) {
  const options = require("argly")
    .createParser({
      "--help": {
        type: "boolean",
        description: "Show this help message"
      },
      "--files --file -f *": {
        type: "string[]",
        description: "A set of directories or files to pretty print"
      },
      "--ignore -i": {
        type: "string[]",
        description: 'An ignore rule (default: --ignore "/node_modules" ".*")'
      },
      "--syntax -s": {
        type: "string",
        description:
          'The syntax (either "html" or "concise"). Defaults to "html"'
      },
      "--max-len": {
        type: "int",
        description: "The maximum line length. Defaults to 80"
      },
      "--no-semi": {
        type: "boolean",
        description: "If set, will format JS without semicolons"
      },
      "--single-quote": {
        type: "boolean",
        description: "If set, will prefer single quotes"
      }
    })
    .usage("Usage: $0 <pattern> [options]")
    .example("Prettyprint a single template", "$0 template.marko")
    .example("Prettyprint a single template", "$0 template.marko")
    .example("Prettyprint all templates in the current directory", "$0 .")
    .example("Prettyprint multiple templates", "$0 template.marko src/ foo/")

    .validate(function(result) {
      if (result.help) {
        this.printUsage();
        process.exit(0);
      }

      if (!result.files || result.files.length === 0) {
        this.printUsage();
        process.exit(1);
      }
    })
    .onError(function(err) {
      this.printUsage();

      if (err) {
        console.log();
        console.log(err);
      }

      process.exit(1);
    })
    .parse(argv);

  return options;
};

exports.run = function run(options) {
  options = {
    syntax: "html",
    maxLen: 80,
    noSemi: false,
    singleQuote: false,
    ignore: ["/node_modules", ".*"],
    ...options
  };

  options.ignore = options.ignore.filter(s => (s = s.trim()) && !s.match(/^#/));
  options.ignore = options.ignore.map(
    pattern => new Minimatch(pattern, mmOptions)
  );

  const found = {};
  let foundCount = 0;

  if (options.files && options.files.length) {
    walk(options.files, {
      file(file) {
        const basename = nodePath.basename(file);

        if (basename.endsWith(".marko")) {
          foundCount++;
          prettyprint(file, options);
        }
      }
    });
  }

  if (foundCount) {
    console.log(`Prettyprinted ${foundCount} templates(s)!`);
  } else {
    console.log(`No templates found!`);
  }

  function prettyprint(path) {
    if (found[path]) {
      return;
    }

    found[path] = true;

    const src = fs.readFileSync(path, { encoding: "utf8" });
    const outputSrc = markoPrettyprint(src, {
      syntax: options.syntax,
      maxLen: options.maxLen,
      noSemi: options.noSemi,
      singleQuote: options.singleQuote,
      filename: path
    });

    fs.writeFileSync(path, outputSrc, { encoding: "utf8" });

    console.log(`Prettyprinted: ${relativePath(path)}`);
  }

  function isIgnored(path, dir, stat) {
    if (path.startsWith(dir)) {
      path = path.substring(dir.length);
    }

    path = path.replace(/\\/g, "/");

    let ignore = false;
    const ignoreRulesLength = options.ignore.length;
    for (let i = 0; i < ignoreRulesLength; i++) {
      const rule = options.ignore[i];
      let match = rule.match(path);

      if (!match && stat && stat.isDirectory()) {
        try {
          stat = fs.statSync(path);
        } catch (e) {}

        if (stat && stat.isDirectory()) {
          match = rule.match(path + "/");
        }
      }

      if (match) {
        if (rule.negate) {
          ignore = false;
        } else {
          ignore = true;
        }
      }
    }

    return ignore;
  }

  function walk(files, opts) {
    if (!files || files.length === 0) {
      throw "No files provided";
    }

    if (!Array.isArray(files)) {
      files = [files];
    }

    var fileCallback = opts.file;

    function walkDir(dir) {
      var children = fs.readdirSync(dir);

      if (children.length) {
        children.forEach(function(basename) {
          var file = nodePath.join(dir, basename);
          var stat;
          try {
            stat = fs.statSync(file);
          } catch (e) {
            return;
          }

          if (!isIgnored(file, dir, stat)) {
            if (stat.isDirectory()) {
              walkDir(file);
            } else {
              fileCallback(file);
            }
          }
        });
      }
    }

    for (var i = 0; i < files.length; i++) {
      var file = nodePath.resolve(cwd, files[i]);

      var stat = fs.statSync(file);

      if (stat.isDirectory()) {
        walkDir(file);
      } else {
        fileCallback(file);
      }
    }
  }
};

function relativePath(path) {
  if (path.startsWith(cwd)) {
    return path.substring(cwd.length + 1);
  }

  return path;
}
