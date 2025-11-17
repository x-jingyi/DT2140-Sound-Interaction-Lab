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

// 全局存储加速度
let accX = 0, accY = 0, accZ = 0;

function draw() {
    // p5.js 自动更新加速度
    accX = accelerationX;
    accY = accelerationY;
    accZ = accelerationZ;

    // 【假设修正】：如果你的 sketch.js 第 132 行在这里（或其他地方）
    // 引用了未定义的 accelerationChange，请将其移除或注释。
    // 假设你只需要上面三行，则无需修改。
}

// 设备摇动事件
function deviceShaken() {
    shaketimer = millis();
    // 变色提示
    statusLabels[0].style("color", "pink");

    if (!dspNode) return;

    // 计算摇动强度
    let strength = Math.sqrt(accX * accX + accY * accY + accZ * accZ);
    strength = constrain(strength, 0, 30); // 限制最大值

    // 将强度映射到 wind 参数 (假设 wind 参数范围 0~1)
    let windValue = map(strength, 0, 30, 0, 2);

    // 【关键修复】：根据控制台输出，参数地址应为 /windchimes/wind_chimes/wind
    dspNode.setParamValue("/windchimes/wind_chimes/wind", windValue);

    // 【建议添加】：如果风铃没有声音，可能需要一个瞬时触发器（Gate/Trigger）
    // 你可以尝试查看 DSP Params 中是否有类似 /windchimes/gate 或 /windchimes/trigger 的参数
    // 如果有，你可以尝试添加如下代码（但请先尝试上面的修复）：
    /*
    dspNode.setParamValue("/windchimes/gate", 1);
    setTimeout(() => {
        dspNode.setParamValue("/windchimes/gate", 0);
    }, 100);
    */

    // 控制台打印便于调试
    console.log("strength:", strength.toFixed(2), "windValue:", windValue.toFixed(2));
}

// 设备移动事件（可选）
function deviceMoved() {
    movetimer = millis();
    statusLabels[2].style("color", "pink");
}

// 设备旋转事件（可选）
function deviceTurned() {
    threshVals[1] = turnAxis;
}

//==========================================================================================
// UTILS
//==========================================================================================

function getMinMaxParam(address) {
    const exampleMinMaxParam = findByAddress(dspNodeParams, address);
    const [exampleMinValue, exampleMaxValue] = getParamMinMax(exampleMinMaxParam);
    console.log('Min value:', exampleMinValue, 'Max value:', exampleMaxValue);
    return [exampleMinValue, exampleMaxValue];
}