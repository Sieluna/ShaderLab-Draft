const flowElement = document.getElementById("workflow");
const heightLocate = (flowElement.clientHeight - 53) / 2;
const widthLocate = flowElement.clientWidth / 2;

export let structure = {
    "drawflow": {
        "Home": {
            "data": {
                "1": {
                    "id": 1, "name": "vertex", "data": {}, "class": "vertex",
                    "html": `
                        <div>
                            <div class="title-box">vertex shader</div>
                        </div>
                    `,
                    "typenode": false,
                    "inputs": {
                        "input_1": { "connections": [] }
                    },
                    "outputs": {
                        "output_1": { "connections": [{ "node":"2", "output":"input_1" }] }
                    },
                    "pos_x": widthLocate - 18 - 160, "pos_y": heightLocate
                },
                "2": {
                    "id": 2, "name": "fragment", "data": {}, "class": "fragment",
                    "html": `
                        <div>
                            <div class="title-box">fragment shader</div>
                        </div>
                    `,
                    "typenode": false,
                    "inputs": {
                        "input_1": { "connections": [{"node":"1","input":"output_1" }] }
                    },
                    "outputs": {},
                    "pos_x": widthLocate + 18, "pos_y": heightLocate
                }
            }
        }
    }
};
