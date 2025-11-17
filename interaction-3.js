// 绑定设备方向事件
if (window.DeviceOrientationEvent) {
    window.addEventListener("deviceorientation", (event) => {
        const rotx = event.alpha || 0;   // 绕 z 轴
        const roty = event.beta || 0;    // 绕 x 轴
        const rotz = event.gamma || 0;   // 绕 y 轴
        rotationChange(rotx, roty, rotz);
    }, true);
}

// map 函数
function map(value, in_min, in_max, out_min, out_max, clamp = false) {
    let v = (value - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    if (clamp) {
        v = Math.max(out_min, Math.min(out_max, v));
    }
    return v;
}

// rotationChange 函数
function rotationChange(rotx, roty, rotz) {
    if (!statusLabels || !statusLabels[1]) return;

    // 动态改变颜色：角度越大越深
    const hue = map(abs(roty), 0, 360, 0, 330, true); // 红色到粉色
    statusLabels[1].style("color", `hsl(${hue}, 100%, 70%)`);

    // 映射到 force
    const minForce = 0.01;
    const maxForce = 1.0;
    const rotationValue = Math.abs(roty);
    const forceValue = map(rotationValue, 0, 360, minForce, maxForce, true);

    playAudio(forceValue);
}

// playAudio 保持不变
function playAudio(force) {
    if (!dspNode) return;
    if (audioContext.state === 'suspended') audioContext.resume();
    dspNode.setParamValue("/wind/wind/force", force);
}
