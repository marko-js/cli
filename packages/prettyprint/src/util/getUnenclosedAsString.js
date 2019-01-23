const TOKENS = {};
TOKENS["{"] = {
  tokens: TOKENS,
  end: "}"
};
TOKENS["["] = {
  tokens: TOKENS,
  end: "]"
};
TOKENS["("] = {
  tokens: TOKENS,
  end: ")"
};
TOKENS["/"] = {
  noMatchPrevious: /[\]})A-Z0-9.]\s*$/i,
  tokens: {
    "[": {
      tokens: {},
      skipEscaped: true,
      end: "]"
    }
  },
  skipEscaped: true,
  end: "/"
};
TOKENS['"'] = {
  tokens: {},
  skipEscaped: true,
  end: '"'
};
TOKENS["'"] = {
  tokens: {},
  skipEscaped: true,
  end: "'"
};
TOKENS["`"] = {
  tokens: {
    $: {
      fullToken: "${",
      tokens: TOKENS,
      end: "}"
    }
  },
  skipEscaped: true,
  end: "`"
};

function getUnenclosedAsString(string) {
  let stack = [];
  let current = { tokens: TOKENS };
  let unenclosed = "";
  for (let index = 0; index < string.length; index++) {
    const char = string[index];
    let next;
    if (current.skipEscaped && char === "\\") {
      index++;
      continue;
    }
    if ((next = current.tokens[char])) {
      if (next.fullToken) {
        if (
          string.slice(index, index + next.fullToken.length) === next.fullToken
        ) {
          stack.push(current);
          current = next;
          index += next.fullToken.length - 1;
          continue;
        }
      } else if (next.noMatchPrevious) {
        if (!next.noMatchPrevious.test(string.slice(0, index))) {
          stack.push(current);
          current = next;
          continue;
        }
      } else {
        stack.push(current);
        current = next;
        continue;
      }
    }
    if (current.end === char) {
      current = stack.pop();
      continue;
    }
    if (stack.length === 0) {
      unenclosed += char;
    }
  }
  return unenclosed;
}

module.exports = getUnenclosedAsString;
