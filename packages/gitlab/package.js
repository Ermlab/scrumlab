Package.describe({
    summary: "Gitlab for meteor"
});

Npm.depends({
    gitlab: "0.8.6"
});

Package.on_use(function (api) {
    api.export("GitLab");
    api.add_files("gitlab.js", "server");
});