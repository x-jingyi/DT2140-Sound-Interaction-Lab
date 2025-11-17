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
const dspName = "wind"; // 🚨 更改 DSP 名称为 "wind"
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
wind.createDSP(audioContext, 1024) // 🚨 使用 wind.createDSP
    .then(node => {
        dspNode = node;
        dspNode.connect(audioContext.destination);
        console.log('params: ', dspNode.getParams()); // 🚨 检查 /force 参数的准确地址！
        const jsonString = dspNode.getJSON();
        jsonParams = JSON.parse(jsonString)["ui"][0]["items"];
        dspNodeParams = jsonParams
        // 现在可以调用 getMinMaxParam 打印 /force 的范围
        getMinMaxParam("/wind/wind/force"); // ⚠️ 替换为你在 console.log 中看到的实际地址
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
    // 🚨 禁用此交互
}

function mousePressed() {
    // 🚨 禁用此交互（只用于桌面调试）
}

function deviceMoved() {
    movetimer = millis();
    statusLabels[2].style("color", "pink");
    // 🚨 禁用此交互
}

function deviceTurned() {
    threshVals[1] = turnAxis;

    // 🚨 使用 turnAxis 的绝对值来映射 force 参数
    // turnAxis 通常是旋转轴的度数 (-180 到 180)
    // 将 abs(turnAxis) 从 0-180 映射到 force 的范围。
    // 假设 /force 的 Min 是 0.1, Max 是 1.0 (请根据 console.log 的实际值修改)
    const minForce = 0.1; // ⚠️ 根据 getMinMaxParam 确认并修改
    const maxForce = 1.0; // ⚠️ 根据 getMinMaxParam 确认并修改

    // p5.js 的 map 函数: map(value, start1, stop1, start2, stop2, [withinBounds])
    const forceValue = map(abs(turnAxis), 0, 180, minForce, maxForce, true);

    playAudio(forceValue); // 触发音频播放和参数更新
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
        return;
    }
    console.log('Setting force to:', force);
    // 🚨 更改为 /wind/force 地址
    // **请根据 console.log 确认的实际参数地址修改 "/wind/force"**
    dspNode.setParamValue("/wind/wind/force", force);
}

//==========================================================================================
// END
//==========================================================================================