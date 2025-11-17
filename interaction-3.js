//==========================================================================================
// AUDIO SETUP
//------------------------------------------------------------------------------------------
//
//------------------------------------------------------------------------------------------
// Edit just where you're asked to!
//------------------------------------------------------------------------------------------
//
//==========================================================================================
let dspNode = null;
let dspNodeParams = null;
let jsonParams = null;

// Change here to ("wind") for your wind.wasm file
const dspName = "wind";
const instance = new FaustWasm2ScriptProcessor(dspName);

// output to window or npm package module
if (typeof module === "undefined") {
    window[dspName] = instance;
} else {
    const exp = {};
    exp[dspName] = instance;
    module.exports = exp;
}

// The name should be the same as the WASM file, so change brass with wind
wind.createDSP(audioContext, 1024)
    .then(node => {
        dspNode = node;
        dspNode.connect(audioContext.destination);
        console.log('params: ', dspNode.getParams()); // 检查 /force 参数的准确地址！
        const jsonString = dspNode.getJSON();
        jsonParams = JSON.parse(jsonString)["ui"][0]["items"];
        dspNodeParams = jsonParams
        // 现在可以调用 getMinMaxParam 打印 /force 的范围
        getMinMaxParam("/wind/wind/force"); // ⚠️ 请根据 console.log 确认实际地址
        console.log('✅ DSP Node created and ready.');
    });


//==========================================================================================
// INTERACTIONS
//------------------------------------------------------------------------------------------
//
//------------------------------------------------------------------------------------------
// Edit the next functions to create interactions
// Decide which parameters you're using and then use playAudio to play the Audio
//------------------------------------------------------------------------------------------
//
//==========================================================================================

function accelerationChange(accx, accy, accz) {
    // 🚨 禁用此交互
}

function rotationChange(rotx, roty, rotz) {
    // 🚨 使用 rotationZ (rotz)
    console.log('▶️ Rotation Change Detected. rotationZ:', rotz);

    // rotationZ (rotz) 的范围通常是 0 到 360 度，但可能包含负值
    // 我们关注旋转的程度，所以使用归一化后的值或绝对值。
    // 假设我们使用 abs(rotz) 映射到 0 到 360（一圈）

    // ⚠️ 根据 getMinMaxParam 确认 /force 的实际范围
    const minForce = 0.01; // 最小力矩保持一个很小的值，避免静音
    const maxForce = 1.0;

    // 将旋转角度的绝对值映射到 force 参数
    // 我们使用 map(abs(rotz), 0, 360, ...)
    // 注意：在许多设备上，rotz 的范围是 -180 到 180 或 0 到 360
    // 使用 p5.js 的 `const rotationIntensity = map(abs(rotz), 0, 360, 0, 1);` 来计算旋转强度

    // 这里我们简化，使用 abs(rotz) 的一个百分比来控制 force，
    // 假设 rotz 的有效范围是 0-360 度
    // 更好的方法是使用 `p5.js` 的 `map` 函数，但如果 `rotz` 是 -180 到 180，则需要调整起始值

    // 假设 rotz 范围为 0 到 360:
    const rotationValue = abs(rotz); // 获取旋转的绝对值，忽略方向
    // 将 0-360 映射到 minForce-maxForce
    const forceValue = map(rotationValue, 0, 360, minForce, maxForce, true);

    playAudio(forceValue); // 触发音频播放和参数更新
}

function mousePressed() {
    // 🚨 禁用此交互
}

function deviceMoved() {
    movetimer = millis();
    statusLabels[2].style("color", "pink");
    // 🚨 禁用此交互
}

function deviceTurned() {
    // 🚨 禁用此交互
}
function deviceShaken() {
    shaketimer = millis();
    statusLabels[0].style("color", "pink");
    // 🚨 禁用此交互
}

function getMinMaxParam(address) {
    const exampleMinMaxParam = findByAddress(dspNodeParams, address);
    // ALWAYS PAY ATTENTION TO MIN AND MAX, ELSE YOU MAY GET REALLY HIGH VOLUMES FROM YOUR SPEAKERS
    const [exampleMinValue, exampleMaxValue] = getParamMinMax(exampleMinMaxParam);
    console.log(`Min value for ${address}:`, exampleMinValue, `Max value for ${address}:`, exampleMaxValue);
    return [exampleMinValue, exampleMaxValue]
}

//==========================================================================================
// AUDIO INTERACTION
//------------------------------------------------------------------------------------------
//
//------------------------------------------------------------------------------------------
// Edit here to define your audio controls 
//------------------------------------------------------------------------------------------
//
//==========================================================================================

function playAudio(force) { // 🚨 接收 force 参数
    if (!dspNode) {
        return;
    }
    if (audioContext.state === 'suspended') {
        // 🚨 如果 AudioContext 挂起，尝试恢复。
        audioContext.resume();
        console.log('AudioContext resumed.');
    }

    console.log('Setting force to:', force);
    // 🚨 设置 force 参数
    dspNode.setParamValue("/wind/wind/force", force); // ⚠️ 请根据 console.log 确认实际地址
}

//==========================================================================================
// END
//==========================================================================================