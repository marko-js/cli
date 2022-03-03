module.exports = {
  presets: [
    [
      "@babel/env",
      {
        loose: true,
        targets: {
          node: "8"
        }
      }
    ]
  ],
  plugins: [
    ["@babel/transform-runtime", { loose: true }],
    ["@babel/proposal-class-properties", { loose: true }],
    ["@babel/proposal-object-rest-spread", { loose: true }]
  ]
};
