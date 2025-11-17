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
        // console.log('params: ', dspNode.getParams()); // 禁用控制台输出
        const jsonString = dspNode.getJSON();
        jsonParams = JSON.parse(jsonString)["ui"][0]["items"];
        dspNodeParams = jsonParams
        // getMinMaxParam("/wind/wind/force"); // 禁用控制台输出
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
    // 禁用此交互
}

function rotationChange(rotx, roty, rotz) {
    // 🚨 改变颜色以示触发
    statusLabels[1].style("color", "pink");

    // 假设你的 p5.js draw() 中有逻辑将颜色改回默认，否则颜色会保持粉色。

    // 使用 rotationY (roty) 来控制风力。
    let rotationValue = abs(roty);

    // ⚠️ 假设 /force 的 Min/Max 范围是 0.01 到 1.0 
    const minForce = 0.01;
    const maxForce = 1.0;

    // 假设 rotationY 的变化范围最大为 360 度
    const forceValue = map(rotationValue, 0, 360, minForce, maxForce, true);

    playAudio(forceValue);
}

function mousePressed() {
    // 🚨 恢复：用于激活 AudioContext，并给一个基础 Force 值
    // 避免在没有旋转时 force 变为 0 导致静音
    playAudio(0.01);
    // Use this for debugging from the desktop!
}

function deviceMoved() {
    movetimer = millis();
    statusLabels[2].style("color", "pink");
    // 禁用音频触发
}

function deviceTurned() {
    // 禁用此交互
}
function deviceShaken() {
    shaketimer = millis();
    statusLabels[0].style("color", "pink");
    // 禁用音频触发
}

function getMinMaxParam(address) {
    const exampleMinMaxParam = findByAddress(dspNodeParams, address);
    const [exampleMinValue, exampleMaxValue] = getParamMinMax(exampleMinMaxParam);
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

function playAudio(force) {
    if (!dspNode) {
        return;
    }
    if (audioContext.state === 'suspended') {
        audioContext.resume(); // 确保 AudioContext 激活
    }

    // 设置 force 参数
    dspNode.setParamValue("/wind/wind/force", force);
}

//==========================================================================================
// END
//==========================================================================================