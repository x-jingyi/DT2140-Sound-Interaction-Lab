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
        // console.log('✅ DSP Node created and ready.'); // 禁用控制台输出
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
    // 🚨 根据你的要求，使用 statusLabels[1]（即第二个标签，如果它是 "turned"）
    statusLabels[1].style("color", "pink");

    // 使用 rotationZ (rotz)
    let rotationValue = abs(rotz); // 获取 Z 轴旋转的绝对值，范围大约 0-360 度

    // ⚠️ 假设 /force 的 Min/Max 范围是 0.01 到 1.0 
    const minForce = 0.01;
    const maxForce = 1.0;

    // 将 0-360 度映射到 minForce-maxForce
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
    // console.log(`Min value for ${address}:`, exampleMinValue, `Max value for ${address}:`, exampleMaxValue);
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