#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { styles, colors } = require("../config/style.js");

const param = {
    src: path.join(__dirname, "../static"),
    dst: path.join(__dirname, "../views"),
    ext: "html"
}

const checkDst = dir => {
    if (!fs.existsSync(path.resolve(dir)))
        fs.mkdirSync(path.resolve(dir));
}

const checkExt = (src, ext) => {
    return ext.includes(path.extname(path.resolve(src)).slice(1));
}

const copy = (filePath, callback = () => {}) => {
    if (checkExt(filePath, param.ext)) {
        const file = path.join(param.dst, path.basename(filePath));
        const readStream = fs.createReadStream(path.resolve(filePath));
        const writeStream = fs.createWriteStream(path.resolve(file))
        readStream.pipe(writeStream);
        writeStream.on("close", callback)
        console.log(`> ${styles.bold(colors.cyan("[Copy]"))} ${filePath} -> ${file}`);
    }
}

const remove = filePath => {
    fs.unlink(filePath, err => {
        if (err) throw err;
        else console.log(`> ${styles.bold(colors.magenta("[Delete]"))} ${filePath}`)
    })
}

const cut = filePath => {
    copy(filePath, () => {
        remove(filePath);
    });
};

/**
 * Collect files
 * @param {string} root
 * @param {cut|copy} callback
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
            })
        });
    });
};

checkDst(param.dst);

collect(param.src);
