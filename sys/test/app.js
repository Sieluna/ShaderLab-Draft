const engine = require("../config/engine.js");
const expect = require("chai").expect;
const path = require("node:path");
const open = require("open");

const join = (base, others) => typeof others === "string" ? path.posix.join(base, others) :
                                Array.isArray(others) ? path.posix.join(base, ...others) : base;

describe("App test", () => {
    let url;
    describe("App function test", () => {
        describe("Path join test", () => {
            beforeEach(() => {
                const single = "/:single\\";
                const multi = ["objA", "objB"];
                const empty = "";
                url = path.posix.join(join(`/api/${single}`, multi), empty);
            });
            it("should return the forward slash", () => {
                expect(url).to.be.equal("/api/:single\\/objA/objB");
            });
        });
        describe("Open params into array", () => {
            const data = [(a, b) => a + b, (a, b) => a - b];
            const func = (a, b) => a(2, 1) + b(2, 1);
            it("should return sum of 3 and 1 equal to 4", () => {
                expect(func(...data)).to.be.equal(4);
            });
        });
        describe("Object length", () => {
            const data = { a: "1", b: "2", c: "3" };
            const str = "123";
            it("should be equal to 3", () => {
                expect(Object.values(data).length).to.be.equal(3);
            })
        });
        describe("Get data from object", () => {
           const data = {};
           const { a, b } = data;
           it("should not get a and b", () => {
               expect(a).to.be.undefined;
               expect(b).to.be.undefined;
           });
        });
    });
    describe("App engine test", () => {
        before(async () => open(path.resolve(__dirname, "./benchmark/app.engine.html")));
        it("should compile file with build in function", () => {
            let compiled = new engine.Compiler("{{ JSON.stringify(obj) }}", { obj: { a: 1, b: 2, c: 3, d: 4 } });
            expect(compiled.generate).to.be.equal('{"a":1,"b":2,"c":3,"d":4}');
        });
        it("should compile file with loop", () => {
            let compiled = new engine.Compiler(`
            <table>
                <!-- {{for list item index}} -->
                <tr>
                    <td>{{item.name}}</td>
                    <td>{{if item.age>18}} 18+ {{/if}}</td>
                </tr>
                <!-- {{/for}} -->
            </table>
            `, {
                list: [
                    { id: 1, name: "Tony", age: 21 },
                    { id: 2, name: "Lily", age: 17 },
                    { id: 3, name: "Mary", age: 18 },
                ]
            });
            expect(compiled.generate).to.be.equal(`
            <table>
                
                <tr>
                    <td>Tony</td>
                    <td> 18+ </td>
                </tr>
                
                <tr>
                    <td>Lily</td>
                    <td></td>
                </tr>
                
                <tr>
                    <td>Mary</td>
                    <td></td>
                </tr>
                
            </table>
            `);
        });
        it("should compile file with html inject", () => {
            let compiled = new engine.Compiler(`
            <div>{{#html}}</div>
            `, { html: `<button onclick="alert('CLICK')">click</button>` });
            expect(compiled.generate).to.be.equal(`
            <div><button onclick="alert('CLICK')">click</button></div>
            `);
        });
        it("should not compile file with html inject", () => {
            let compiled = new engine.Compiler(`
            <div>{{html}}</div>
            `, { html: `<button onclick="alert('CLICK')">click</button>` });
            expect(compiled.generate).to.be.not.equal(`
            <div><button onclick="alert('CLICK')">click</button></div>
            `);
        });
    });
});
