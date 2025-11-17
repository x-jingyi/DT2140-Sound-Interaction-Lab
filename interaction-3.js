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
    // 🚨 关键修改：使用 roty (rotationY)
    statusLabels[1].style("color", "pink");

    // 使用 rotationY (roty) 来控制风力。
    // rotationY 在设备平放时，通常反映绕重力轴的旋转（即在桌面上转动）。
    // 范围通常是 -90 到 90（当设备立起来时）或 0 到 360（当设备平放时，依赖于设备和浏览器）。
    let rotationValue;

    // 假设 roty 的范围是 0 到 360 度，或者我们取其绝对值，映射一个较大的变化。
    // 如果你在平放旋转时 roty 有较大的 0-360 变化，则使用它。
    rotationValue = abs(roty);

    // ⚠️ 假设 /force 的 Min/Max 范围是 0.01 到 1.0 
    const minForce = 0.01;
    const maxForce = 1.0;

    // 假设 rotationY 的变化范围最大为 360 度
    const forceValue = map(rotationValue, 0, 360, minForce, maxForce, true);

    playAudio(forceValue);
}

function mousePressed() {
    // 禁用此交互
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
    // 禁用控制台输出
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
        audioContext.resume();
    }

    // 设置 force 参数
    dspNode.setParamValue("/wind/wind/force", force);
}

//==========================================================================================
// END
//==========================================================================================