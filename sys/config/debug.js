const flag = process.env.ENABLE_DEBUG || true;

module.exports = {
    log: (...msg) => {
        if (flag) console.log(...msg);
    }
}
