export const commonVertex = `
  varying vec2 vUv;
  varying vec3 vCol;
  varying vec4 vPosition;
  varying vec4 vRawPosition;
  ${THREE.ShaderChunk["fog_pars_vertex"]}
  void main() {
    vUv = uv;
    vCol = vec3(1.0,1.0,1.0);
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    gl_Position = projectionMatrix * mvPosition;
    vPosition = modelMatrix * vec4( position, 1.0 );
    vRawPosition = vec4(position, 1.0);
    ${THREE.ShaderChunk["fog_vertex"]}
  }
`;

export const floorFragment = `
  varying vec2 vUv;
  varying vec3 vCol;
  varying vec4 vPosition;

  uniform sampler2D uColors;
  uniform float uState;
  uniform float uAnimationProgress;
  uniform float uBlackBorder;
  uniform float uIsRoof;

  ${THREE.ShaderChunk["common"]}
  ${THREE.ShaderChunk["fog_pars_fragment"]}

  void main() {
    vec4 color = texture2D(uColors, vec2(floor(vPosition.x + 0.5) / %CANVAS_SIZE%, 1.0 - floor(-vPosition.y + 0.5) / %CANVAS_SIZE%));
    float lineThickness = 0.02;
    if(fract(vPosition.x + 0.5) < lineThickness || fract(vPosition.x + 0.5) > 1.0 - lineThickness || fract(vPosition.y + 0.5) < lineThickness || fract(vPosition.y + 0.5) > 1.0 - lineThickness) {
      if(uState == 2.0) {
        color = vec4(mix(vec3(0.3), vec3(0.7), uAnimationProgress), 1.0);
      } else {
        color = vec4(0.3, 0.3, 0.3, 1.0);
      }
      if(uBlackBorder == 1.0 && uIsRoof == 0.0) {
        color = vec4(0.0,0.0,0.0,1.0);
      }
    } else if(uBlackBorder == 1.0 && uIsRoof == 1.0) {
      color = vec4(1.0);
    }

    gl_FragColor = color;
    ${THREE.ShaderChunk["fog_fragment"]}
  }
`;

export const wallFragment = `
  varying vec2 vUv;
  varying vec3 vCol;
  varying vec4 vPosition;

  uniform vec3 uLight;
  uniform float uState;
  uniform float uAnimationProgress;
  uniform float overrideAnimation;

  ${THREE.ShaderChunk["common"]}
  ${THREE.ShaderChunk["fog_pars_fragment"]}

  void main() {
    if(uState == 7.0) {
      if(vPosition.z < 0.1) {
        gl_FragColor = vec4(0.4, 0.4, 0.4, 1.0);
      } else {
        gl_FragColor = vec4(0.1,0.1,0.1,1.0);
      }
    } else if(uState == 6.0 || uState == 2.0) {
      vec3 baseColor = vec3(0.1);
      vec3 highlightColor = uLight;

      if(overrideAnimation == 1.0) {
        baseColor = vec3(1.0);
      }

      vec3 color = baseColor;

      float stripeWidth = 2.0;

      if(4.0 - vPosition.z < stripeWidth && overrideAnimation == 0.0) {
        color = mix(highlightColor, baseColor, smoothstep(4.0, 4.0 - stripeWidth, vPosition.z));
      }
      if(vPosition.z < stripeWidth) {
        color = mix(highlightColor, baseColor, smoothstep(0.0, stripeWidth, vPosition.z));
      }

      if(uState == 2.0 && overrideAnimation == 0.0) {
        color = mix(color, vec3(1.0,1.0,1.0), uAnimationProgress);
        if(vPosition.z > 3.9 || vPosition.z < 0.1) {
          color = mix(vec3(0.7), vec3(0.0), uAnimationProgress);
        }
      } else {
        if(vPosition.z > 3.9 || vPosition.z < 0.1) {
          if(overrideAnimation == 1.0) {
            color = vec3(0.0);
          } else {
            color = vec3(0.7);
          }
        }
      }

      gl_FragColor = vec4(color, 1.0);
    }

    else {
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
        if(overrideAnimation == 1.0) {
          color = vec3(0.0);
        } else {
          color = vec3(0.7);
        }
      }


      gl_FragColor = vec4(color, 1.0);
    }
    ${THREE.ShaderChunk["fog_fragment"]}
  }
`;

export const buttonStandFragment = `
  varying vec4 vPosition;

  uniform float uActive;
  uniform float uState;

  ${THREE.ShaderChunk["common"]}
  ${THREE.ShaderChunk["fog_pars_fragment"]}

  void main() {
    vec3 color = vec3(0.3);

    if(vPosition.z > 1.2) {
      if(uActive > 0.0) {
        color = vec3(0.0,0.7, 0.0);
      } else {
        color = vec3(0.7,0.0, 0.0);
      }
    }

    if(uState <= 2.0) {
      color = mix(color, vec3(1.0), 0.5);
    }
    gl_FragColor = vec4(color, 1.0);
    ${THREE.ShaderChunk["fog_fragment"]}
  }
`;

export const floorButtonFragment = `
  varying vec4 vPosition;

  ${THREE.ShaderChunk["common"]}
  ${THREE.ShaderChunk["fog_pars_fragment"]}

  void main() {
    vec3 color = vec3(0.3);

    gl_FragColor = mix(vec4(0.0,0.7,0.0,1.0),vec4(0.0,0.7,0.0,0.0), vPosition.z / 1.4);

    ${THREE.ShaderChunk["fog_fragment"]}
  }
`;
