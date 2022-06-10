#!/usr/bin/env node
const { stdout } = require("node:process");
const path = require("node:path");
const fs = require("node:fs");
const { styles, colors } = require("../debug/style.js");

const param = {
    src: path.join(__dirname, "../static"),
    dst: path.join(__dirname, "../views"),
    ext: "html"
}

/**
 * Check directory exist
 * @param {string} dir
 */
const checkDst = dir => {
    if (!fs.existsSync(path.resolve(dir)))
        fs.mkdirSync(path.resolve(dir));
}

/**
 * Check file extension
 * @param {string} src
 * @param {string} ext
 * @return {boolean}
 */
const checkExt = (src, ext) => {
    return ext.includes(path.extname(path.resolve(src)).slice(1));
}

/**
 * Cut file
 * @param {string} filePath
 */
const cut = filePath => {
    copy(filePath, () => {
        remove(filePath);
    });
};

/**
 * Copy file
 * @param {string} filePath
 * @param {function} callback
 */
const copy = (filePath, callback = () => {}) => {
    if (checkExt(filePath, param.ext)) {
        const file = path.join(param.dst, path.basename(filePath));
        const readStream = fs.createReadStream(path.resolve(filePath));
        const writeStream = fs.createWriteStream(path.resolve(file));
        readStream.pipe(writeStream);
        writeStream.on("close", callback);
        stdout.write(`> ${styles.bold(colors.cyan("[Copy]"))} ${filePath} -> ${file}\n`);
    }
}

/**
 * Remove file
 * @param {string} filePath
 */
const remove = filePath => {
    fs.unlink(filePath, err => {
        if (err) throw err;
        else stdout.write(`> ${styles.bold(colors.magenta("[Delete]"))} ${filePath}\n`);
    })
}

/**
 * Collect files
 * @param {string} root
 * @param {function|cut|copy} callback
 */
const collect = (root, callback = cut) => {
    root = path.resolve(root);
    fs.stat(root, (err, stats) => {
        if (err) throw err;
        if (!stats.isDirectory()) {
            callback(root);
            return;
        }
        fs.readdir(root, (err, files) => {
            if (err) throw err;
            files.forEach((file) => {
                collect(path.join(root, file), callback);
            });
        });
    });
};

checkDst(param.dst);

collect(param.src);
