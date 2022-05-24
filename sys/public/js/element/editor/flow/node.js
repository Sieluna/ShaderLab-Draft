export const vsNode = `
    <div>
        <div class="title-box">
            <img src="/img/editor/shader.svg" alt="">
            Vertex Shader
        </div>
    </div>
`;

export const fsNode = `
    <div>
        <div class="title-box">
            <img src="/img/editor/shader.svg" alt="">
            Fragment Shader
        </div>
    </div>
`;

export const imageNode = `
    <div>
        <div class="title-box">
            <img src="/img/editor/image.svg" alt="">
            Image
        </div>
        <div class="box">
            <input class="image" type="file" value="Select image">
        </div>
    </div>
`;

export const meshNode = `
    <div>
        <div class="title-box">
            <img src="/img/editor/grid.svg" alt="">
            Mesh
        </div>
    </div>
`;

export const timeNode = `
    
`;

export const bufferNode = `
    <div>
        <div class="title-box">
            <img src="/img/editor/buffer.svg" alt="">
            RT handle
        </div>
        <div class="box">
            <p>RT name</p>
            <div class="buffer-container">
                <input class="buffer" type="text" df-name placeholder="buffer name">
            </div>
        </div>
    </div>
`;

export const customNode = `
    <div>
        <div class="title-box">
            <img src="/img/editor/code.svg" alt="">
            <input class="custom" type="text" df-name placeholder="node name">
        </div>
    </div>
`;
