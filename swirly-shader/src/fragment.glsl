uniform float uTime;
uniform float progress;
uniform float numberOfLines;
uniform sampler2D texture1;
uniform vec4 resolution;
varying vec2 vUv;
varying vec3 vPosition;
uniform vec3 baseFirst;
uniform vec3 baseSecond;
uniform vec3 accent;

//Noise
#define M_PI 3.14159265358979323846

float rand(vec2 co){return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);}
float rand (vec2 co, float l) {return rand(vec2(rand(co), l));}
float rand (vec2 co, float l, float t) {return rand(vec2(rand(co, l), t));}

float perlin(vec2 p, float dim, float time) {
	vec2 pos = floor(p * dim);
	vec2 posx = pos + vec2(1.0, 0.0);
	vec2 posy = pos + vec2(0.0, 1.0);
	vec2 posxy = pos + vec2(1.0);
	
	float c = rand(pos, dim, time);
	float cx = rand(posx, dim, time);
	float cy = rand(posy, dim, time);
	float cxy = rand(posxy, dim, time);
	
	vec2 d = fract(p * dim);
	d = -0.5 * cos(d * M_PI) + 0.5;
	
	float ccx = mix(c, cx, d.x);
	float cycxy = mix(cy, cxy, d.x);
	float center = mix(ccx, cycxy, d.y);
	
	return center * 2.0 - 1.0;
}

// p must be normalized!
float perlin(vec2 p, float dim) {
	
	/*vec2 pos = floor(p * dim);
	vec2 posx = pos + vec2(1.0, 0.0);
	vec2 posy = pos + vec2(0.0, 1.0);
	vec2 posxy = pos + vec2(1.0);
	
	// For exclusively black/white noise
	/*float c = step(rand(pos, dim), 0.5);
	float cx = step(rand(posx, dim), 0.5);
	float cy = step(rand(posy, dim), 0.5);
	float cxy = step(rand(posxy, dim), 0.5);*/
	
	/*float c = rand(pos, dim);
	float cx = rand(posx, dim);
	float cy = rand(posy, dim);
	float cxy = rand(posxy, dim);
	
	vec2 d = fract(p * dim);
	d = -0.5 * cos(d * M_PI) + 0.5;
	
	float ccx = mix(c, cx, d.x);
	float cycxy = mix(cy, cxy, d.x);
	float center = mix(ccx, cycxy, d.y);
	
	return center * 2.0 - 1.0;*/
	return perlin(p, dim, 0.0);
}

float lines(vec2 uv, float offset){
    return smoothstep(
        0.0, 0.5 + offset*0.5,
        abs(0.5*(sin(uv.x*numberOfLines) + offset*2.0))
    );
}

mat2 rotate2D(float angle){
    return mat2(
        cos(angle),-sin(angle),
        sin(angle),cos(angle)
    );
}

void main(){
    float slowTime = uTime * 0.15; 

    vec3 sphereNormal = normalize(vPosition);

    vec2 distortion = vec2(
        perlin(sphereNormal.xy + vec2(slowTime), 3.0),
        perlin(sphereNormal.yz + vec2(0.0, slowTime), 3.0)
    );

    vec2 liquidCoord = sphereNormal.zx * 2.0 + distortion * 0.5;
    float n = perlin(liquidCoord, 3.0);

    vec2 baseUV = rotate2D(n * 2.5) * sphereNormal.xy;
    
    float basePattern = lines(baseUV, 0.5);
    float secondPattern = lines(baseUV, 0.1);

    vec3 baseColor = mix(baseSecond, baseFirst, basePattern);
    vec3 secondColor = mix(baseColor, accent, secondPattern);

    gl_FragColor = vec4(secondColor, 1.0);
}