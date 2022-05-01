const flag = process.env.ENABLE_DEBUG || false;

module.exports = {
    log: (...msg) => {
        if (flag) console.log(...msg);
    }
}
