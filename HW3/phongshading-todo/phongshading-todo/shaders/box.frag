#version 300 es
precision mediump float;

out vec4 FragColor;

uniform float ambientStrength, specularStrength, diffuseStrength, shininess;

in vec3 Normal;          // 法向量（顶点着色器传递）
in vec3 FragPos;         // 片元在世界空间的位置
in vec2 TexCoord;        // 纹理坐标
in vec4 FragPosLightSpace;// 片元在光源空间的位置（用于阴影计算）

uniform vec3 viewPos;    // 相机在世界空间的位置
uniform vec4 u_lightPosition; // 光源位置（w=1点光源，w=0平行光）
uniform vec3 lightColor; // 光源颜色

uniform sampler2D diffuseTexture; // 漫反射纹理
uniform sampler2D depthTexture;   // 深度纹理（阴影图）
uniform samplerCube cubeSampler;  // 立方体贴图（未使用，保留原定义）

// TODO3: 阴影计算函数（返回0=非阴影，1=完全阴影）
float shadowCalculation(vec4 fragPosLightSpace, vec3 normal, vec3 lightDir) {
    // 1. 将光源空间的片元位置转换到NDC（标准化设备坐标）[-1,1]
    vec3 projCoords = fragPosLightSpace.xyz / fragPosLightSpace.w;
    // 2. NDC转纹理坐标[0,1]（因为深度纹理的坐标范围是0-1）
    projCoords = projCoords * 0.5 + 0.5;

    // 3. 从深度纹理中采样光源空间的深度值（最近的遮挡物深度）
    float closestDepth = texture(depthTexture, projCoords.xy).r;
    // 4. 当前片元在光源空间的深度值（注意：需要修正z轴范围，因为透视投影的z值是非线性的）
    float currentDepth = projCoords.z;

    // 5. 阴影偏移（解决阴影 acne 问题：片元与遮挡物因精度问题重叠）
    float bias = max(0.05 * (1.0 - dot(normal, lightDir)), 0.005);

    // 6. 软阴影（PCF采样：对周围多个纹理像素采样取平均）
    float shadow = 0.0;
    vec2 texelSize = 1.0 / vec2(textureSize(depthTexture, 0)); // 纹理像素大小
    for(int x = -1; x <= 1; x++) {
        for(int y = -1; y <= 1; y++) {
            // 采样周围9个像素的深度
            float pcfDepth = texture(depthTexture, projCoords.xy + vec2(x, y) * texelSize).r;
            // 如果当前片元深度 > 采样深度 + 偏移，则判定为阴影
            shadow += (currentDepth - bias > pcfDepth) ? 1.0 : 0.0;
        }
    }
    shadow /= 9.0; // 平均9个采样点，得到软阴影效果

    // 7. 边界处理：超出光源视锥范围的片元不计算阴影
    if(projCoords.z > 1.0) {
        shadow = 0.0;
    }

    return shadow;
}

void main() {
    // 采样纹理颜色（漫反射纹理）
    vec3 TextureColor = texture(diffuseTexture, TexCoord).xyz;

    // 标准化法向量和光照方向
    vec3 norm = normalize(Normal);
    vec3 lightDir;
    if(u_lightPosition.w == 1.0) {
        // 点光源：光照方向 = 片元位置 -> 光源位置
        lightDir = normalize(u_lightPosition.xyz - FragPos);
    } else {
        // 平行光：光照方向 = 光源方向向量（直接使用）
        lightDir = normalize(u_lightPosition.xyz);
    }

    // TODO2: Phong光照模型计算（环境光、漫反射光、镜面光）
    // 1. 环境光（Ambient）：固定强度的环境光照
    vec3 ambient = ambientStrength * lightColor;

    // 2. 漫反射光（Diffuse）：与光照方向和法向量夹角相关
    float diff = max(dot(norm, lightDir), 0.0); // 夹角余弦值（取非负）
    vec3 diffuse = diffuseStrength * diff * lightColor;

    // 3. 镜面光（Specular）：与视角、反射光方向相关
    vec3 viewDir = normalize(viewPos - FragPos); // 视角方向（片元 -> 相机）
    vec3 reflectDir = reflect(-lightDir, norm); // 反射光方向（入射光取反，因为lightDir是片元->光源）
    // Phong模型：反射光与视角的夹角
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess); // shininess是高光指数（值越大高光越集中）
    vec3 specular = specularStrength * spec * lightColor;

    // 合并光照颜色（环境光 + 漫反射 + 镜面光）
    vec3 lightReflectColor = ambient + diffuse + specular;

    // 计算阴影（1.0=完全阴影，0.0=无阴影）
    float shadow = shadowCalculation(FragPosLightSpace, norm, lightDir);

    // 最终颜色 = （1 - 阴影影响）* 光照颜色 * 纹理颜色
    // 注：原代码用shadow/2.0是为了减弱阴影强度，可根据需求调整
    vec3 resultColor = (1.0 - shadow / 2.0) * lightReflectColor * TextureColor;

    FragColor = vec4(resultColor, 1.0);
}