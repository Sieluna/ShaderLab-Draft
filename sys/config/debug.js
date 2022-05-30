const data = require("./style.js");

const devMode = process.env.NODE_ENV != "production";

const log = (...msg) => {
    if (devMode) {
        console.log(...msg);
    }
}

Object.keys(data).forEach((value) => {
    switch (value) {
        case "reset":
            break;
        case "styles":
            const styles = data[value];
            Object.keys(styles).forEach((style) => {
                log[style] = (...msg) => {
                    if (msg.length > 1) {
                        log(styles[style](msg.join(" ")));
                    } else {
                        log(styles[style](msg));
                    }
                }
                const colors = data["colors"];
                Object.keys(colors).forEach((color) => {
                    log[style][color] = (...msg) => {
                        if (msg.length > 1) {
                            log(styles[style](colors[color](msg.join(" "))));
                        } else {
                            log(styles[style](colors[color](msg)));
                        }
                    }
                });
            });
            break;
        case "colors":
            const colors = data[value];
            Object.keys(colors).forEach((color) => {
                log[color] = (...msg) => {
                    if (msg.length > 1) {
                        log(colors[color](msg.join(" ")));
                    } else {
                        log(colors[color](msg));
                    }
                }
            });
            break;
    }
});

module.exports.log = log;
