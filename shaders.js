export const commonVertex = `
  varying vec2 vUv;
  varying vec3 vCol;
  varying vec4 vPosition;
  varying vec4 vRawPosition;
  void main() {
    vUv = uv;
    vCol = vec3(1.0,1.0,1.0);
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    gl_Position = projectionMatrix * mvPosition;
    vPosition = modelMatrix * vec4( position, 1.0 );
    vRawPosition = vec4(position, 1.0);
  }
`;

export const floorFragment = `
  varying vec2 vUv;
  varying vec3 vCol;
  varying vec4 vPosition;

  uniform float uRippleProgress;
  uniform vec2 uRippleCenter;
  uniform sampler2D uColors;

  void main() {
    vec4 color = texture2D(uColors, vec2(floor(vPosition.x + 0.5) / %CANVAS_SIZE%, 1.0 - floor(-vPosition.y + 0.5) / %CANVAS_SIZE%));
    float lineThickness = 0.02;
    if(fract(vPosition.x + 0.5) < lineThickness || fract(vPosition.x + 0.5) > 1.0 - lineThickness || fract(vPosition.y + 0.5) < lineThickness || fract(vPosition.y + 0.5) > 1.0 - lineThickness) {
      float distance = length(vPosition - vec4(cameraPosition.x, cameraPosition.y, 0.0, 1.0));
      color = mix(vec4(0.3, 0.3, 0.3, 1.0), color, distance / 10.0);
    } else {
      if(uRippleProgress > 0.0) {
        float rippleWidth = 6.0;
        float dist = length(vec2(floor(vPosition.x + 0.5), floor(vPosition.y + 0.5)) - uRippleCenter) - uRippleProgress;

        if(abs(dist) < rippleWidth) {
          // color = vec4(vec3(1.0 - abs(dist) / rippleWidth), 1.0);
          color = mix(color, vec4(vec3(1.0 - abs(dist) / rippleWidth), 1.0), 1.0 - abs(dist) / rippleWidth);
        }
      }
    }

    gl_FragColor = color;
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

export const doorFragment = `
  varying vec2 vUv;
  varying vec3 vCol;
  varying vec4 vPosition;
  varying vec4 vRawPosition;

  void main() {
    vec3 color = vec3(0.0);
    float lineThickness = 0.02;
    if((fract(vRawPosition.x + 0.5) < lineThickness || fract(vRawPosition.x + 0.5) > 1.0 - lineThickness) && (fract(vRawPosition.y + 0.5) < lineThickness || fract(vRawPosition.y + 0.5) > 1.0 - lineThickness)) {
      color = vec3(0.7, 0.0, 0.0);
    } else {
      color = vec3(0.1);
    }

    if(vRawPosition.z > 1.7 || vRawPosition.z < -1.7) {
      color = vec3(0.7, 0.0, 0.0);
    }

    gl_FragColor = vec4(color, 1.0);
  }
`;
