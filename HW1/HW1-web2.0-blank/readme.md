## HW1 使用webgl完成交互动画集合造型

### 基本任务

1. 按照滑动条数值生成顶点

```javascript
// 监听滑动条, 在滑动时重新生成图形
document.getElementById("slider").onchange = function (event) {
        numTimesToSubdivide = parseInt(event.target.value);
        generateKochSnowflake(vertices[0], vertices[1], vertices[2], numTimesToSubdivide);
        sliderchangeflag = true;
    };

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
...
    if (sliderchangeflag)//如果slider值有变化需要发送Gasket2D 新初始顶点属性数据给shader
    {
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, colorbufferId);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsOfVertexs), gl.STATIC_DRAW);
    }
...
}
```



2. 使用按钮控制旋转

```js
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

// 每次调用render根据设定速度刷新角度值实现旋转动画
function render() {
    ...
    if (animflag)//如果旋转控制按钮由切换，需要发送旋转角度给shader
    {
        theta += spead;
        gl.uniform1f(thetaLoc, theta);
    };
	...
}
```



3. 鼠标点击画布重新选择图像中心

```js
// 增加鼠标点击事件,移动坐标中心
    canvas.addEventListener("mousedown", function (event) {
        var x = event.clientX;
        var y = event.clientY;
        var rect = event.target.getBoundingClientRect();
        centerX = (x - rect.left) / rect.width * 2 - 1;
        centerY = 1 - (y - rect.top) / rect.height * 2;
        centerchageflag = true;
    });
```

### 额外任务

1. 将基本图像换成"科赫雪花"

```
// 如上使用递归函数生成顶点并重新绘制实现
```

2. 统计分形图形的顶点数和FPS

```js
        var fps = Math.round((frame * 1000) / (now - lastTime))
        document.getElementById("vertexCount").innerHTML = (" | 顶点数量: " + points.length / 2);
```

