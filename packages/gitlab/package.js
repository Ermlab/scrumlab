Package.describe({
    summary: "Gitlab for meteor"
});

// I made some changes to official NPM gitlab module (v0.8.6), so for now
// we are using a local copy of the module
// See https://www.npmjs.org/package/gitlab

//Npm.depends({"gitlab":"0.8.6"});

Package.on_use(function (api) {
    api.export("GitLab");
    api.add_files("gitlab.js", "server");
});