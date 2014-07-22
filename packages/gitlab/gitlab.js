// I made some changes to official NPM gitlab module (v0.8.6), so for now
// we are using a local copy of the module
// See https://www.npmjs.org/package/gitlab

// GitLab = Npm.require("gitlab");
GitLab = Npm.require(process.env.PWD);
