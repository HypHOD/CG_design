"use strict";

var canvas;
var gl;

var numTimesToSubdivide = 0;
var points = []; //存放所生成的所有顶点的位置

var bufferId;
var colorbufferId;

// 科赫雪花的基础三角形顶点
var vertices = [
    vec2(0, 0.5),      // 顶部顶点
    vec2(-0.433, -0.25), // 左下顶点
    vec2(0.433, -0.25)   // 右下顶点
];

// ------------- add -------------
var colorsOfVertexs = []; //存放所生成的所有顶点的颜色
var c1, c2, c3;
c1 = vec4(0.0, 0.8, 1.0, 1.0); // 天蓝色
c2 = vec4(0.0, 0.6, 0.9, 1.0); // 深蓝色
c3 = vec4(0.0, 0.4, 0.8, 1.0); // 更深的蓝色

var theta = 0.0;
var spead = 0.01;
var thetaLoc;
var centerX = 0.0;
var centerXLoc;
var centerY = 0.0;
var centerYLoc;

var animflag = false;
var sliderchangeflag = false;
var centerchageflag = false;//如果鼠标重新点击了中心，需要把新中心传递给shader

window.onload = function init() {
    // 初始化Canvas画布
    canvas = document.getElementById("gl-canvas");
    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    // 设置视口和清除时的填充颜色
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    // 生成科赫雪花顶点数据，保存到 points 中
    generateKochSnowflake(vertices[0], vertices[1], vertices[2], numTimesToSubdivide);

    // 加载顶点着色器和片元着色器
    var program = initShaders(gl, "shaders/gasket2D.vert", "shaders/gasket2D.frag");
    gl.useProgram(program);

    // 初始化顶点位置缓冲
    // 缓冲的数据会被传输到着色器对应的变量当中
    bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    // 配置顶点属性，将顶点缓冲和着色器变量关联
    var vPosition = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    colorbufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorbufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsOfVertexs), gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "aColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    // 获取Uniform变量位置
    thetaLoc = gl.getUniformLocation(program, "theta");
    centerXLoc = gl.getUniformLocation(program, "centerX");
    centerYLoc = gl.getUniformLocation(program, "centerY");

    // 初始化uniform变量
    gl.uniform1f(thetaLoc, theta);
    gl.uniform1f(centerXLoc, centerX);
    gl.uniform1f(centerYLoc, centerY);

    render();


    // 增加滑动条的监听程序,重新生成顶点，重新绘制
    document.getElementById("slider").onchange = function (event) {
        numTimesToSubdivide = parseInt(event.target.value);
        generateKochSnowflake(vertices[0], vertices[1], vertices[2], numTimesToSubdivide);
        sliderchangeflag = true;
    };


    // 增加鼠标点击事件,移动坐标中心
    canvas.addEventListener("mousedown", function (event) {
        var x = event.clientX;
        var y = event.clientY;
        var rect = event.target.getBoundingClientRect();
        centerX = (x - rect.left) / rect.width * 2 - 1;
        centerY = 1 - (y - rect.top) / rect.height * 2;
        centerchageflag = true;

    });

    // 动画启动/停止监听器 Initialize event handlers
    document.getElementById("Animation").onclick = function () {
        animflag = !animflag;

    };
    document.getElementById("speadUp").onclick = function () {
        spead += 0.05;
    };
    document.getElementById("speadDown").onclick = function () {
        spead -= 0.05;
    };
};

/*********绘图界面随窗口交互缩放而相应变化**************/
window.onresize = function () {
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
    gl.viewport((canvas.width - canvas.height) / 2, 0, canvas.height, canvas.height);

    render();
}



// 科赫曲线递归函数
function kochCurve(p1, p2, depth) {
    if (depth == 0) {
        // 基础情况：直接绘制线段
        points.push(p1, p2);
        colorsOfVertexs.push(c1, c2);
        return;
    }

    // 计算三等分点
    var p1_3 = mix(p1, p2, 1.0 / 3.0);
    var p2_3 = mix(p1, p2, 2.0 / 3.0);

    // 计算科赫曲线的中间点（形成等边三角形的顶点）
    var dx = p2[0] - p1[0];
    var dy = p2[1] - p1[1];
    var length = Math.sqrt(dx * dx + dy * dy);

    // 计算垂直方向（逆时针旋转90度）
    var perpX = -dy / length;
    var perpY = dx / length;

    // 计算等边三角形的高度
    var height = length * Math.sqrt(3) / 6;

    // 中间点坐标
    var midX = (p1[0] + p2[0]) / 2 + perpX * height;
    var midY = (p1[1] + p2[1]) / 2 + perpY * height;
    var midPoint = vec2(midX, midY);

    // 递归调用
    kochCurve(p1, p1_3, depth - 1);
    kochCurve(p1_3, midPoint, depth - 1);
    kochCurve(midPoint, p2_3, depth - 1);
    kochCurve(p2_3, p2, depth - 1);
}

// 生成科赫雪花
function generateKochSnowflake(a, b, c, depth) {
    // 清空之前的点
    points = [];
    colorsOfVertexs = [];

    // 生成三条科赫曲线
    kochCurve(a, b, depth);
    kochCurve(b, c, depth);
    kochCurve(c, a, depth);
}


function render() {
    countFPS();
    gl.clear(gl.COLOR_BUFFER_BIT);

    if (animflag)//如果旋转控制按钮由切换，需要发送旋转角度给shader
    {
        theta += spead;
        gl.uniform1f(thetaLoc, theta);
    };


    if (sliderchangeflag)//如果slider值有变化需要发送Gasket2D 新初始顶点属性数据给shader
    {
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, colorbufferId);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsOfVertexs), gl.STATIC_DRAW);
    }

    if (centerchageflag)//如果鼠标重新点击了中心，需要把新中心传递给shader
    {
        gl.uniform1f(centerXLoc, centerX);
        gl.uniform1f(centerYLoc, centerY);
    }

    gl.drawArrays(gl.LINES, 0, points.length);
    sliderchangeflag = false;
    centerchageflag = false;

    // ------------- 请求下一帧 -------------
    requestAnimFrame(render);
}

var frame = 0;
var allFrameCount = 0;
var lastTime = Date.now();
var lastFameTime = Date.now();
function countFPS() {
    var now = Date.now();
    lastFameTime = now;
    // 不置 0，在动画的开头及结尾记录此值的差值算出 FPS
    allFrameCount++;
    frame++;

    if (now > 1000 + lastTime) {
        var fps = Math.round((frame * 1000) / (now - lastTime))
        console.log(`${new Date()} 1S内 FPS：`, fps);
        document.getElementById("label").innerHTML = ("FPS: " + fps);
        document.getElementById("vertexCount").innerHTML = (" | 顶点数量: " + points.length / 2);
        frame = 0;
        lastTime = now;
    };

}