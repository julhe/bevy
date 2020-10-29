#version 450

const int MAX_LIGHTS = 10;

struct Light {
    mat4 proj;
    vec4 pos;
    vec4 color;
};

layout(location = 0) in vec3 v_Position;
layout(location = 1) in vec3 v_Normal;
layout(location = 2) in vec2 v_Uv;
layout(location = 3) in vec4 v_Color;

layout(location = 0) out vec4 o_Target;

layout(set = 0, binding = 0) uniform Camera {
    mat4 ViewProj;
};

layout(set = 1, binding = 0) uniform Lights {
    uvec4 NumLights;
    Light SceneLights[MAX_LIGHTS];
};

layout(set = 3, binding = 0) uniform StandardMaterial_albedo {
    vec4 Albedo;
};

# ifdef STANDARDMATERIAL_ALBEDO_TEXTURE
layout(set = 3, binding = 1) uniform texture2D StandardMaterial_albedo_texture;
layout(set = 3, binding = 2) uniform sampler StandardMaterial_albedo_texture_sampler;
# endif

#define max3(a,b,c) (max(a, max(b,c)))
//half3 Luminance(half3 c){
//   //src: https://github.com/mrdooz/kumi/blob/master/effects/luminance.hlsl
//   return dot(c, half3(0.299, 0.587, 0.114));
//}
vec3 fastTonemap(vec3 c) {
    float luma = max3(c.r, c.g, c.b);
    return c * (1.0 / (luma * 0.8 + 1.1));
}

void main() {
    vec4 output_color = Albedo;
    output_color.rgb *= v_Color.rgb;
# ifdef STANDARDMATERIAL_ALBEDO_TEXTURE
    output_color *= texture(
        sampler2D(StandardMaterial_albedo_texture, StandardMaterial_albedo_texture_sampler),
        v_Uv);
# endif

# ifdef STANDARDMATERIAL_SHADED
    vec3 normal = normalize(v_Normal);
    vec3 ambient = vec3(0.53, 0.61, 0.65) * 5.27;
    // accumulate color
    vec3 color = vec3(0.0);
    for (int i=0; i<int(NumLights.x) && i<MAX_LIGHTS; ++i) {
        Light light = SceneLights[i];
        // compute Lambertian diffuse term
        vec3 light_dir = normalize(light.pos.xyz - v_Position);
        float diffuse = dot(normal, light_dir) > 0.0 ? 1.0 : 0.0;
        // add light contribution
        color += mix(ambient, light.color.xyz, diffuse);
    }
    output_color.xyz *= color;
# endif

    // multiply the light by material color
    output_color.rgb = fastTonemap(output_color.rgb);
    output_color.rgb *=  output_color.rgb; // sorta gamma correction
    o_Target = output_color ;
}
