const runner = window.mocha.run();

let success = true;

runner.once("fail", () => {
  success = false;
});

runner.on("end", () => {
  console.log("result:", {
    success,
    coverage: window.__coverage__
  });
});
