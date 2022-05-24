#!/usr/bin/env node
import fetch from "node-fetch";
import fs from "fs";
import path from "path";

/**
 * Get nested files
 * @param {string} url js delivery root!
 * @param {string} target target path
 */
const look = (url, target) => {
    fetch(url, {
        method: "GET"
    }).then(result => result.text()).then(text => {
        /**
         * In js delivery <class listing> is the characteristic of js delivery html
         * e.g, "https://cdn.jsdelivr.net/npm/aaaa/bbbb@xx.yy.zz/"
         * need we find aaaa/bbbb/cccc/ or aaaa/bbbb/cccc
         * first case should goto recursive function
         */
        const all = text.split(`<div class="listing">`).pop().match(/"\/npm(.*?)"/g);
        for (const element of all) {
            if (element.match(/(.*?)\/"/g)) {
                const folder = element.replaceAll('"', "").split("/").slice(-2).shift();
                const newUrl = url + folder + "/";
                look(newUrl, target + folder + "/");
            } else {
                const file = element.replaceAll('"', "").split("/").slice(-1).pop();
                fetch(url + file, {
                    method: "GET"
                }).then(result => result.text()).then(text => {
                    const absPath = path.resolve(target);
                    if (!fs.existsSync(absPath)) fs.mkdirSync(absPath, { recursive: true });
                    fs.writeFile(path.join(absPath, file), text, err => {
                        if (err) throw err;
                        console.log("Create file", target + file);
                    });
                });
            }
        }
    });
};

look("https://cdn.jsdelivr.net/npm/@babylonjs/core/", "./babylon/core/");
