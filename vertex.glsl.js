export default `#version 300 es

in vec2 position;
in vec4 color;

out vec4 vColor;

void main() {
  vColor = color;
  gl_Position = vec4(position.xy, 0, 1);
}
`;