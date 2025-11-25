var points = []; //顶点的属性：坐标数组
var colors = []; //顶点的属性：颜色数组

const VertexColors = [
    vec4(0.0, 0.0, 0.0, 1.0),  // black
    vec4(0.0, 0.0, 1.0, 1.0),  // blue
    vec4(1.0, 0.0, 0.0, 1.0),  // red
    vec4(0.0, 0.5, 0.0, 1.0),  // light-green        
    vec4(0.0, 0.0, 0.5, 1.0),  // light-blue
    vec4(0.5, 0.0, 0.0, 1.0),  // light-red
    vec4(0.0, 1.0, 0.0, 1.0),  // green
    vec4(0.5, 0.5, 0.5, 1.0)   // grey
];// 常量颜色

/****************************************************
 * 坐标轴模型：X轴，Y轴，Z轴的顶点位置和颜色,(-1,1)范围内定义 
 ****************************************************/
function vertextsXYZ() {
    const len = 0.9;
    var XYZaxis = [
        vec4(-len, 0.0, 0.0, 1.0), // X
        vec4(len, 0.0, 0.0, 1.0),
        vec4(len, 0.0, 0.0, 1.0),
        vec4(len - 0.01, 0.01, 0.0, 1.0),
        vec4(len, 0.0, 0.0, 1.0),
        vec4(len - 0.01, -0.01, 0.0, 1.0),

        vec4(0.0, -len, 0.0, 1.0), // Y
        vec4(0.0, len, 0.0, 1.0),
        vec4(0.0, len, 0.0, 1.0),
        vec4(0.01, len - 0.01, 0.0, 1.0),
        vec4(0.0, len, 0.0, 1.0),
        vec4(-0.01, len - 0.01, 0.0, 1.0),

        vec4(0.0, 0.0, -len, 1.0), // Z
        vec4(0.0, 0.0, len, 1.0),
        vec4(0.0, 0.0, len, 1.0),
        vec4(0.01, 0.0, len - 0.01, 1.0),
        vec4(0.0, 0.0, len, 1.0),
        vec4(-0.01, 0.0, len - 0.01, 1.0)
    ];

    var XYZColors = [
        vec4(1.0, 0.0, 0.0, 1.0),  // red
        vec4(0.0, 1.0, 0.0, 1.0),  // green
        vec4(0.0, 0.0, 1.0, 1.0),  // blue
    ];

    for (var i = 0; i < XYZaxis.length; i++) {
        points.push(XYZaxis[i]);
        var j = Math.trunc(i / 6); // JS取整运算Math.trunc//每个方向轴用6个顶点
        colors.push(XYZColors[j]);
    }
}

/****************************************************
 * 立方体模型生成
 ****************************************************/
function generateCube() {
    quad(1, 0, 3, 2); //Z正-前
    quad(4, 5, 6, 7); //Z负-后

    quad(2, 3, 7, 6); //X正-右
    quad(5, 4, 0, 1); //X负-左

    quad(6, 5, 1, 2); //Y正-上
    quad(3, 0, 4, 7); //Y负-下
}

function quad(a, b, c, d) {
    const vertexMC = 0.5; // 顶点分量X,Y,Z到原点距离
    var vertices = [
        vec4(-vertexMC, -vertexMC, vertexMC, 1.0), //Z正前面左下角点V0，顺时针四点0~3
        vec4(-vertexMC, vertexMC, vertexMC, 1.0),
        vec4(vertexMC, vertexMC, vertexMC, 1.0),
        vec4(vertexMC, -vertexMC, vertexMC, 1.0),
        vec4(-vertexMC, -vertexMC, -vertexMC, 1.0),   //Z负后面左下角点V4，顺时针四点4~7
        vec4(-vertexMC, vertexMC, -vertexMC, 1.0),
        vec4(vertexMC, vertexMC, -vertexMC, 1.0),
        vec4(vertexMC, -vertexMC, -vertexMC, 1.0)
    ];

    var indices = [a, b, c, a, c, d];
    for (var i = 0; i < indices.length; ++i) {
        points.push(vertices[indices[i]]);  // 保存一个顶点坐标到定点给数组vertices中        
        colors.push(VertexColors[a]); // 立方体每面为单色
    }
}

/****************************************************
 * 球体模型生成：由四面体递归生成
 ****************************************************/
function generateSphere() {
    // 细分次数和顶点
    const numTimesToSubdivide = 5; // 球体细分次数
    var va = vec4(0.0, 0.0, -1.0, 1.0);
    var vb = vec4(0.0, 0.942809, 0.333333, 1.0);
    var vc = vec4(-0.816497, -0.471405, 0.333333, 1.0);
    var vd = vec4(0.816497, -0.471405, 0.333333, 1.0);

    function triangle(a, b, c) {
        points.push(a);
        points.push(b);
        points.push(c);

        colors.push(vec4(0.0, 1.0, 1.0, 1.0));
        colors.push(vec4(1.0, 0.0, 1.0, 1.0));
        colors.push(vec4(0.0, 1.0, 0.0, 1.0));
    };

    function divideTriangle(a, b, c, count) {
        if (count > 0) {
            var ab = mix(a, b, 0.5);
            var ac = mix(a, c, 0.5);
            var bc = mix(b, c, 0.5);

            ab = normalize(ab, true);
            ac = normalize(ac, true);
            bc = normalize(bc, true);

            divideTriangle(a, ab, ac, count - 1);
            divideTriangle(ab, b, bc, count - 1);
            divideTriangle(bc, c, ac, count - 1);
            divideTriangle(ab, bc, ac, count - 1);
        }
        else {
            triangle(a, b, c);
        }
    }

    function tetrahedron(a, b, c, d, n) {
        divideTriangle(a, b, c, n);
        divideTriangle(d, c, b, n);
        divideTriangle(a, d, b, n);
        divideTriangle(a, c, d, n);
    };

    tetrahedron(va, vb, vc, vd, numTimesToSubdivide); // 递归细分生成球体
}

/****************************************************
* TODO1: 墨西哥帽模型生成，等距细分得z,x，函数计算得到y
****************************************************/
function generateHat() {

    // 这里(x,z)是区域（-1，-1）到（1，1）平均划分成nRows*nColumns得到的交点坐标；
    var nRows = 11; // 线数，实际格数=nRows-1,
    var nColumns = 11; // 线数,实际格数=nColumns-1

    // 嵌套数组data用于存储网格上交叉点的高值(y)值。
    var data = new Array(nRows);
    for (var i = 0; i < nRows; i++) {
        data[i] = new Array(nColumns);
    };

    // 遍历网格上每个点，求点的高度(即Y值)
    for (var i = 0; i < nRows; i++) {
        for (var j = 0; j < nColumns; j++) {
            // 计算x和z坐标，范围从-1到1
            var x = -1.0 + (2.0 * j) / (nColumns - 1);
            var z = -1.0 + (2.0 * i) / (nRows - 1);

            // 墨西哥帽函数：y = (1 - x² - z²) * e^(-(x² + z²))
            var r_squared = x * x + z * z;
            var y = (1.0 - r_squared) * Math.exp(-r_squared);

            data[i][j] = y;
        }
    }

    // 顶点数据按每四个片元构成一个四边形网格图元，存放顶点属性
    for (var i = 0; i < nRows - 1; i++) {
        for (var j = 0; j < nColumns - 1; j++) {
            // 计算当前网格单元的四个顶点坐标
            var x1 = -1.0 + (2.0 * j) / (nColumns - 1);
            var z1 = -1.0 + (2.0 * i) / (nRows - 1);
            var y1 = data[i][j];

            var x2 = -1.0 + (2.0 * (j + 1)) / (nColumns - 1);
            var z2 = -1.0 + (2.0 * i) / (nRows - 1);
            var y2 = data[i][j + 1];

            var x3 = -1.0 + (2.0 * (j + 1)) / (nColumns - 1);
            var z3 = -1.0 + (2.0 * (i + 1)) / (nRows - 1);
            var y3 = data[i + 1][j + 1];

            var x4 = -1.0 + (2.0 * j) / (nColumns - 1);
            var z4 = -1.0 + (2.0 * (i + 1)) / (nRows - 1);
            var y4 = data[i + 1][j];

            // 将四边形分解为两个三角形
            // 第一个三角形：v1, v2, v3
            points.push(vec4(x1, y1, z1, 1.0));
            points.push(vec4(x2, y2, z2, 1.0));
            points.push(vec4(x3, y3, z3, 1.0));

            // 第二个三角形：v1, v3, v4
            points.push(vec4(x1, y1, z1, 1.0));
            points.push(vec4(x3, y3, z3, 1.0));
            points.push(vec4(x4, y4, z4, 1.0));

            // 使用渐变色为每个三角形顶点添加颜色
            var colorIntensity = (y1 + 1.0) / 2.0; // 将y值从[-1,1]映射到[0,1]
            var color1 = vec4(colorIntensity, 0.5, 1.0 - colorIntensity, 1.0);

            colorIntensity = (y2 + 1.0) / 2.0;
            var color2 = vec4(colorIntensity, 0.5, 1.0 - colorIntensity, 1.0);

            colorIntensity = (y3 + 1.0) / 2.0;
            var color3 = vec4(colorIntensity, 0.5, 1.0 - colorIntensity, 1.0);

            colorIntensity = (y4 + 1.0) / 2.0;
            var color4 = vec4(colorIntensity, 0.5, 1.0 - colorIntensity, 1.0);

            // 为第一个三角形添加颜色
            colors.push(color1);
            colors.push(color2);
            colors.push(color3);

            // 为第二个三角形添加颜色
            colors.push(color1);
            colors.push(color3);
            colors.push(color4);
        }
    }
}

// 解析 OBJ 文本并将三角面加入全局 points/colors
// 支持 v 与 f（f 可为 v / v//vn / v/vt / v/vt/vn），自动三角化多边形
function parseOBJ(text) {
    var positions = [];
    var faces = [];
    var outlinePoints = [];  // 描边顶点
    var outlineColors = [];  // 描边颜色

    var lines = text.split('\n');
    for (var li = 0; li < lines.length; li++) {
        var raw = lines[li].trim();
        if (!raw || raw[0] === '#') continue;
        var parts = raw.split(/\s+/);
        if (parts[0] === 'v' && parts.length >= 4) {
            var x = parseFloat(parts[1]);
            var y = parseFloat(parts[2]);
            var z = parseFloat(parts[3]);
            positions.push([x, y, z]);
        } else if (parts[0] === 'f' && parts.length >= 4) {
            var idxs = [];
            for (var k = 1; k < parts.length; k++) {
                var tok = parts[k];
                if (!tok) continue;
                var vIdxStr = tok.split('/')[0];
                var vi = parseInt(vIdxStr, 10);
                if (!isNaN(vi)) idxs.push(vi);
            }
            if (idxs.length >= 3) faces.push(idxs);
        }
    }

    var defaultColor = vec4(0.2, 0.6, 0.9, 1.0);
    var outlineColor = vec4(0.0, 0.0, 0.0, 1.0); // 描边颜色（黑色）
    var outlineScale = 1.05;
    for (var fi = 0; fi < faces.length; fi++) {
        var f = faces[fi];
        // 拆解多边形为三角形
        for (var i = 1; i < f.length - 1; i++) {
            var tri = [f[0], f[i], f[i + 1]];
            for (var t = 0; t < 3; t++) {
                var oneBased = tri[t];
                var p = positions[oneBased - 1];
                if (!p) continue;
                points.push(vec4(p[0], p[1], p[2], 1.0));
                colors.push(defaultColor);

                // 添加描边顶点和颜色
                var outlineP = vec4(
                    p[0] * outlineScale,
                    p[1] * outlineScale,
                    p[2] * outlineScale,
                    1.0
                );
                outlinePoints.push(outlineP);
                outlineColors.push(outlineColor);
            }
        }
    }
}

