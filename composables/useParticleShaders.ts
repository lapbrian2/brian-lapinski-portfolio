/**
 * GLSL shaders for the atmospheric particle field.
 *
 * Vertex shader:
 *   - Organic drift (sin/cos with per-particle phase)
 *   - Scroll velocity scatter (deeper particles react more)
 *   - Mouse repulsion (soft push within radius)
 *   - Density culling (GPU-side visibility toggle per section)
 *   - Depth-based size attenuation
 *
 * Fragment shader:
 *   - Soft circular point with smoothstep falloff
 *   - Section-driven color blend
 *   - Mouse proximity glow
 *   - Scroll velocity brightness pulse
 *   - Additive blending (natural glow on dark bg)
 */

export const particleVertexShader = /* glsl */ `
  uniform float uTime;
  uniform vec2  uMouse;
  uniform float uScrollVelocity;
  uniform float uDensity;
  uniform vec2  uResolution;
  uniform float uMouseRadius;
  uniform float uPixelRatio;

  attribute float aSize;
  attribute float aSpeed;
  attribute float aPhase;
  attribute float aDepth;

  varying float vAlpha;
  varying float vDepth;
  varying float vMouseDist;

  void main() {
    vec3 pos = position;

    // ── Idle drift: gentle sinusoidal motion ──
    float t = uTime * 0.15 * aSpeed;
    pos.x += sin(t + aPhase) * 0.02 * (1.0 + aDepth * 0.5);
    pos.y += cos(t * 0.7 + aPhase * 1.3) * 0.015 * (1.0 + aDepth * 0.5);

    // ── Scroll velocity response ──
    // Closer particles (higher aDepth) react more strongly
    float velocityInfluence = uScrollVelocity * aDepth;
    pos.y += velocityInfluence * 0.08;
    pos.x += velocityInfluence * 0.02 * sin(aPhase);

    // ── Mouse repulsion ──
    float aspectRatio = uResolution.x / uResolution.y;
    vec2 adjustedPos = vec2(pos.x * aspectRatio, pos.y);
    vec2 adjustedMouse = vec2(uMouse.x * aspectRatio, uMouse.y);
    float dist = distance(adjustedPos, adjustedMouse);
    float mouseInfluence = smoothstep(uMouseRadius, 0.0, dist);

    vec2 repelDir = normalize(adjustedPos - adjustedMouse + 0.001);
    pos.x += repelDir.x * mouseInfluence * 0.06 * aDepth / aspectRatio;
    pos.y += repelDir.y * mouseInfluence * 0.06 * aDepth;

    // ── Point size ──
    float velocityPulse = 1.0 + abs(uScrollVelocity) * 0.3;
    float size = aSize * (0.5 + aDepth * 0.5) * velocityPulse * uPixelRatio;

    // ── Density culling: particles with aSpeed > uDensity become invisible ──
    float densityCull = step(aSpeed, uDensity);

    vAlpha = (0.15 + aDepth * 0.35) * densityCull;
    vDepth = aDepth;
    vMouseDist = mouseInfluence;

    gl_Position = vec4(pos.xy, 0.0, 1.0);
    gl_PointSize = size * densityCull;
  }
`

export const particleFragmentShader = /* glsl */ `
  precision mediump float;

  uniform vec3  uColorA;
  uniform vec3  uColorB;
  uniform float uColorMix;
  uniform float uScrollVelocity;

  varying float vAlpha;
  varying float vDepth;
  varying float vMouseDist;

  void main() {
    // Soft circular point shape
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    if (dist > 0.5) discard;

    // Smooth edge falloff
    float alpha = smoothstep(0.5, 0.15, dist) * vAlpha;

    // Section color blend
    vec3 color = mix(uColorA, uColorB, uColorMix);

    // Mouse proximity glow: brighten particles near cursor
    color += vec3(0.15) * vMouseDist * vDepth;

    // Velocity-driven brightness pulse
    float velocityBrightness = abs(uScrollVelocity) * 0.2;
    color += velocityBrightness * vDepth;

    // Prevent over-saturation
    color = clamp(color, 0.0, 1.0);

    gl_FragColor = vec4(color, alpha);
  }
`
