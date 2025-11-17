//==========================================================================================
// AUDIO SETUP
//==========================================================================================
let dspNode = null;
let dspNodeParams = null;
let jsonParams = null;

// wasm 文件名
const dspName = "windchimes";
const instance = new FaustWasm2ScriptProcessor(dspName);

// 输出实例
if (typeof module === "undefined") {
    window[dspName] = instance;
} else {
    const exp = {};
    exp[dspName] = instance;
    module.exports = exp;
}

// 创建 DSP
windchimes.createDSP(audioContext, 1024)
    .then(node => {
        dspNode = node;
        dspNode.connect(audioContext.destination);

        console.log('DSP Params: ', dspNode.getParams());
        const jsonString = dspNode.getJSON();
        jsonParams = JSON.parse(jsonString)["ui"][0]["items"];
        dspNodeParams = jsonParams;
    });

//==========================================================================================
// INTERACTIONS
//==========================================================================================

// 用于控制文字变色
let shaketimer = 0;

// 解锁 AudioContext (首次点击页面)
function mousePressed() {
    if (audioContext.state === 'suspended') {
        audioContext.resume();
        console.log("AudioContext resumed");
    }
}

// p5.js 会每帧调用
function accelerationChange(accx, accy, accz) {
    shaketimer = millis();

    // 文字变粉色提示触发
    if (statusLabels && statusLabels[0]) {
        statusLabels[0].style("color", "pink");
    }

    if (!dspNode) return;

    // 计算摇动强度
    let strength = Math.sqrt(accx * accx + accy * accy + accz * accz);

    // 限制最大值，防止过大
    strength = constrain(strength, 0, 30);

    // 将摇动强度映射到 wind 参数范围 (0~1)
    let windValue = map(strength, 0, 30, 0, 1);

    // 设置风铃的 wind 参数
    dspNode.setParamValue("/windchimes/wind", windValue);

    console.log("strength:", strength.toFixed(2), "windValue:", windValue.toFixed(2));
}

// 可选：保持原 deviceMoved / deviceTurned 接口
function deviceMoved() {
    if (statusLabels && statusLabels[2]) {
        statusLabels[2].style("color", "pink");
    }
}

function deviceTurned() {
    // 可根据需要使用
}

//==========================================================================================
// UTILS
//==========================================================================================

function getMinMaxParam(address) {
    if (!dspNodeParams) return [0, 1];
    const exampleMinMaxParam = findByAddress(dspNodeParams, address);
    const [exampleMinValue, exampleMaxValue] = getParamMinMax(exampleMinMaxParam);
    console.log('Min value:', exampleMinValue, 'Max value:', exampleMaxValue);
    return [exampleMinValue, exampleMaxValue];
}
