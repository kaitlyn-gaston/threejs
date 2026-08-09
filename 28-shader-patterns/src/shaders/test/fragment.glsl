varying vec2 vUv;

void main()
{
    // Pattern 3
    //float strength = vUv.x;

    // Pattern 4
    // float strength = vUv.y;

    // Pattern 5
    // float strength = 1.0 - vUv.y;

    // Pattern 6
    // float strength = vUv.y*8.0;

    // Pattern 7 window blinds cool
    //float strength = mod(vUv.y * 10.0, 1.0);

    // Pattern 8
    //float strength = round(mod(vUv.y * 10.0, 1.0));

    // Pattern 9
    // float strength = mod(vUv.y * 10.0, 1.0);
    // strength = step(0.75, strength);

    // Pattern 10
    // float strength = mod(vUv.x * 10.0, 1.0);
    // strength = step(0.75, strength);

    // Pattern 11
    float strength = mod(vUv.x * 10.0, 1.0);
    strength = step(0.75, strength);

    gl_FragColor = vec4(vec3(strength), 1.0);
}