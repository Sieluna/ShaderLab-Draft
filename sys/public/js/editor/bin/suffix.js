const fs = require("fs").promises;
const path = require("path");

void async function () {
    try {
        let p = path.resolve(__dirname, "../", process.env.FILTER_PATH.trim());
        console.log("Path: " + p);
        let paths = await fs.readdir(p);
        console.log(paths);
        let stack = [... paths];
        while (stack.length) {
            let top = stack.pop();
            let pat = path.resolve(p, top);
            let stat = await fs.stat(pat);
            if (stat.isDirectory()) {
                let temp = await fs.readdir(pat);
                if (temp) {
                    for (let i of temp) {
                        stack.push(path.join(top, i));
                    }
                }
            } else {
                let personList = await fs.readFile(pat, {encoding: "utf8"});

                const regexpNames = /(?:export|import)(?:\s)*?(?:\{)??.*?(?:\})??(?:\s)*?from(?:\s)*?"(.+?)"/gm;

                let match = personList.matchAll(regexpNames);

                let count = 0;
                for (let item of match) {
                    if (/.js$/.test(item[1])) continue;
                    let temp = item[0];
                    let index = item.index + count;
                    let now = temp.replace(item[1], `${item[1]}.js`);
                    let past = personList.slice(0, index);
                    let feature = personList.slice(index + temp.length, personList.length);
                    personList = `${past}${now}${feature}`;
                    count = count + 3;
                }

                await fs.writeFile(pat, personList, {encoding: "utf8"});
            }
        }
    } catch (error) {
        console.log(error);
    }
}();
