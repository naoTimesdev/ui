module.exports = {
  name: "naoTimesUI-Canary",
  script: "./.output/server/index.mjs",
  interpreter: "bun",
  env: {
    NODE_ENV: "production",
    PORT: "5561",
    HOST: "127.0.0.1",
  },
  watch: false,
};
