const fs = require("fs");
const path = require("path");

const param = {
    src: path.join(__dirname, "../static"),
    dst: path.join(__dirname, "../views"),
    ext: "html"
}

let files = [];

const checkDst = (dir) => {
    if (!fs.existsSync(path.resolve(dir)))
        fs.mkdirSync(path.resolve(dir));
}

const checkExt = (src, ext) => {
    return ext.includes(path.extname(path.resolve(src)).slice(1));
}

const collectCallback = (filePath) => {
    if (checkExt(filePath, param.ext)) {
        const file = path.join(param.dst, path.basename(filePath));
        const readStream = fs.createReadStream(path.resolve(filePath));
        const writeStream = fs.createWriteStream(path.resolve(file))
        readStream.pipe(writeStream);
        console.log(`[Copy] ${filePath} -> ${file}`);
    }
}

const collect = (root, callback = collectCallback) => {
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

