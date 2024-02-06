import vertexShaderSrc from './vertex.glsl.js';
import fragmentShaderSrc from './fragment.glsl.js'

let gl;
let program;
let vao;
let uniformLoc;
let currColor = [0, 0, 0, 0];
let currTriangles = 1;
let maxTriangles = 1;
let useJSON = false;

function uploadFile(event) {
    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const jsonContent = e.target.result;
            const data = JSON.parse(jsonContent);
            // Extract vertex positions and colors from JSON data
            const positions = data.positions;
            const colors = data.colors;
            // Update sliders and buffers accordingly
            updateSliderRange(positions.length / 9); // Assuming each triangle has 3 vertices (9 values)
            // Update buffers with new data
            updateBuffers(positions, colors);
        }
        reader.readAsText(file);
    }
}

function updateSliderRange(maxValue) {
    document.getElementById("triangleSlider").max = maxValue;
    document.getElementById("triangleSlider").value = 1;
}

function updateBuffers(positions, colors) {
    // Create and bind position buffer
    const positionBuffer = createBuffer(positions);
    // Create and bind color buffer
    const colorBuffer = createBuffer(colors);
    // Create VAO
    vao = createVAO(program, positionBuffer, colorBuffer);
}

function createBuffer(data) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    return buffer;
}

function createVAO(program, positionBuffer, colorBuffer) {
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    // Bind position buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positionLoc = gl.getAttribLocation(program, "position");
    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);
    // Bind color buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    const colorLoc = gl.getAttribLocation(program, "color");
    gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorLoc);
    return vao;
}

function initialize() {
    const canvas = document.getElementById("canvas");
    gl = canvas.getContext("webgl2");
    if (!gl) {
        console.error("WebGL2 not supported");
        return;
    }

    // Create shaders and program
    const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSrc);
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSrc);
    program = createProgram(vertexShader, fragmentShader);

    // Get uniform location
    uniformLoc = gl.getUniformLocation(program, 'uColor');

    // Set initial color
    updateColor();

    // Initialize WebGL draw loop
    draw();
}

function createShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function createProgram(vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program linking error:', gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }
    return program;
}

function draw() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);
    gl.uniform4fv(uniformLoc, currColor);
    gl.bindVertexArray(vao);
    gl.drawArrays(gl.TRIANGLES, 0, currTriangles * 3); // Assuming each triangle has 3 vertices

    requestAnimationFrame(draw);
}

// Integration with configuration panel elements
window.updateTriangles = function() {
    currTriangles = parseInt(document.getElementById("triangleSlider").value);
}

window.updateColor = function() {
    currColor = [
        parseFloat(document.getElementById("slider1").value) / 255,
        parseFloat(document.getElementById("slider2").value) / 255,
        parseFloat(document.getElementById("slider3").value) / 255,
        1.0
    ];
}

window.checkBox = function() {
    useJSON = document.getElementById("colorToggle").checked;
    // Additional logic to handle color toggle and update WebGL rendering
}

window.onload = initialize;