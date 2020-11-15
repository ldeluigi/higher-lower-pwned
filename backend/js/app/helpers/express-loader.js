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
                    console.log(route)
                    route = require(route);
                    if (mount) {
                        console.log(`[*] Mounting ${mount}`);
                        router.use(mount.replace('#', ':'), route);
                    } else {
                        router.use(route);
                    }
                } catch (e) {
                    console.error(e);
                }
            }
        });
        return router;
    }
};
