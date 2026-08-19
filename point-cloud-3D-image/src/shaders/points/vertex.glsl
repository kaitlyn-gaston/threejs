uniform float uSize;
uniform float uTime;

varying vec3 vColor;

void main() {
    vColor = color;

    vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * modelViewPosition;

    gl_PointSize = uSize / -modelViewPosition.z;
}