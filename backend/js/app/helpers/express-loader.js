const fs = require("fs");
const path = require("path");
const express = require("express");

module.exports = {
    routerFromDir: function (dirname, filename) {
        const router = express.Router({ mergeParams: true });
        const lsdir = fs.readdirSync(dirname);

        lsdir.forEach(function (fileOrDirectory) {
            var mount,
                route,
                lstat,
                abspath = path.join(dirname, fileOrDirectory);

            if (abspath == filename) {
                return;
            }

            lstat = fs.lstatSync(abspath);

            if (lstat.isDirectory()) {
                route = path.join(abspath, "index.js");
                mount = `/${fileOrDirectory}`;
            } else if (
                lstat.isFile() &&
                path.extname(abspath) == ".js" &&
                !path.basename(abspath).endsWith("test.js") &&
                !path.basename(abspath).endsWith("spec.js")
            ) {
                route = abspath;
            }

            if (route) {
                try {
                    if (mount) {
                        console.log(`[${'*'.repeat((route.match(/[\/\\]/g) || []).length)}] Mounting ${mount}`);
                    }
                    let loadedRoute = require(route);
                    if (mount) {
                        router.use(mount.replace('#', ':'), loadedRoute);
                    } else {
                        router.use(loadedRoute);
                    }
                } catch (e) {
                    console.error(e);
                }
            }
        });
        return router;
    }
};
