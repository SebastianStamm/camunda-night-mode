export const commonVertex = `
  varying vec2 vUv;
  varying vec3 vCol;
  varying vec4 vPosition;
  void main() {
    vUv = uv;
    vCol = vec3(1.0,1.0,1.0);
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    gl_Position = projectionMatrix * mvPosition;
    vPosition = modelMatrix * vec4( position, 1.0 );
  }
`;

export const floorFragment = `
  varying vec2 vUv;
  varying vec3 vCol;
  varying vec4 vPosition;
  void main() {
    vec3 color = vec3(0.0);
    float lineThickness = 0.02;
    if(fract(vPosition.x + 0.5) < lineThickness || fract(vPosition.x + 0.5) > 1.0 - lineThickness || fract(vPosition.y + 0.5) < lineThickness || fract(vPosition.y + 0.5) > 1.0 - lineThickness) {
      color = vec3(0.3);
    } else {
      color = vec3(0.1);
    }

    float distance = length(vPosition - vec4(cameraPosition.x, cameraPosition.y, 0.0, 1.0));

    color = mix(color, vec3(0.1), distance / 10.0);

    gl_FragColor = vec4(color, 1.0);
  }
`;

export const wallFragment = `
  varying vec2 vUv;
  varying vec3 vCol;
  varying vec4 vPosition;

  uniform vec3 uLight;

  void main() {
    vec3 baseColor = vec3(0.1);
    vec3 highlightColor = uLight;
    vec3 color = baseColor;

    float stripeWidth = 1.3;

    if(vPosition.z < stripeWidth) {
      color = mix(highlightColor, baseColor, smoothstep(0.0, stripeWidth, vPosition.z));
    }
    if(4.0 - vPosition.z < stripeWidth) {
      color = mix(highlightColor, baseColor, smoothstep(4.0, 4.0 - stripeWidth, vPosition.z));
    }
    if(vPosition.z > 3.9 || vPosition.z < 0.1) {
      color = vec3(0.7);
    }

    gl_FragColor = vec4(color, 1.0);
  }
`;
