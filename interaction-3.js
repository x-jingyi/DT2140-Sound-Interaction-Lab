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
let lastRotationZ = 0;
let lastTime = 0;
const MAX_FORCE = 1.0;

// Change here to ("tuono") depending on your wasm file name
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

// The name should be the same as the WASM file, so change tuono with brass if you use brass.wasm
wind.createDSP(audioContext, 1024)
    .then(node => {
        dspNode = node;
        dspNode.connect(audioContext.destination);
        dspNode.setParamValue("/wind/wind/force", 0);
        console.log('params: ', dspNode.getParams());
        const jsonString = dspNode.getJSON();
        jsonParams = JSON.parse(jsonString)["ui"][0]["items"];
        dspNodeParams = jsonParams
        // const exampleMinMaxParam = findByAddress(dspNodeParams, "/thunder/rumble");
        // // ALWAYS PAY ATTENTION TO MIN AND MAX, ELSE YOU MAY GET REALLY HIGH VOLUMES FROM YOUR SPEAKERS
        // const [exampleMinValue, exampleMaxValue] = getParamMinMax(exampleMinMaxParam);
        // console.log('Min value:', exampleMinValue, 'Max value:', exampleMaxValue);
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
    // playAudio()
}

function rotationChange(rotx, roty, rotz) {
}

function mousePressed() {
    //playAudio(mouseX / windowWidth)
    // Use this for debugging from the desktop!
}

function deviceMoved() {
    //movetimer = millis();
    //statusLabels[2].style("color", "pink");
}

function deviceTurned() {
    // 假设您使用的框架（如 p5.js）提供了 currentRotationZ
    const currentRotationZ = rotationZ; // 假设 rotationZ 存储了当前的 Z 轴旋转角度（0-360度）
    const currentTime = millis(); // 假设 millis() 返回当前时间（毫秒）

    // 检查是否有上次的数据
    if (lastTime > 0) {
        // 1. 计算角度变化量 (delta)
        let angleDelta = currentRotationZ - lastRotationZ;

        // 处理角度回环（例如从 350度转到 10度，实际变化是 20度，而不是 -340度）
        if (angleDelta > 180) {
            angleDelta -= 360;
        } else if (angleDelta < -180) {
            angleDelta += 360;
        }

        // 取绝对值，我们只关心旋转的快慢，不关心方向
        const absAngleDelta = Math.abs(angleDelta);

        // 2. 计算时间变化量 (deltaTime)
        const deltaTime = currentTime - lastTime; // 毫秒

        // 3. 计算旋转速度 (Speed = Delta Angle / Delta Time)
        // 使用一个较小的deltaTime阈值来避免除以零或数值不稳定
        let rotationSpeed = 0;
        if (deltaTime > 10) {
            // 速度 = 角度变化 (度) / 时间变化 (秒) -> 度/秒
            rotationSpeed = absAngleDelta / (deltaTime / 1000);
        }

        // 4. 将速度映射到音频参数 (Force)
        // 我们需要一个函数将 'rotationSpeed' (例如 0 到 720 度/秒) 映射到 'force' (例如 0 到 MAX_FORCE)
        // 假设最大速度是 720 度/秒，可以根据实际测试调整 
        const maxExpectedSpeed = 270;
        let force = map(rotationSpeed, 0, maxExpectedSpeed, 0, MAX_FORCE);
        force = constrain(force, 0, MAX_FORCE); // 确保值在 0 到 MAX_FORCE 之间

        // 5. 触发音频播放和视觉反馈
        if (rotationSpeed > 5) { // 设置一个最小旋转速度阈值，避免微小抖动触发
            statusLabels[1].style("color", "pink"); // 视觉反馈
            playAudio(force); // 播放音频，并将 force 值传入
        } else {
            // 如果旋转停止，可以将 force 设为 0 来停止或衰减声音
            playAudio(0);
        }
        console.log(`Speed: ${rotationSpeed.toFixed(2)} deg/s, Force: ${force.toFixed(2)}`);

    }

    // 6. 更新历史数据
    lastRotationZ = currentRotationZ;
    lastTime = currentTime;
    threshVals[1] = turnAxis; // 保留原有逻辑

}
function deviceShaken() {
    //shaketimer = millis();
    //statusLabels[0].style("color", "pink");
    //playAudio();
}

function getMinMaxParam(address) {
    const exampleMinMaxParam = findByAddress(dspNodeParams, address);
    // ALWAYS PAY ATTENTION TO MIN AND MAX, ELSE YOU MAY GET REALLY HIGH VOLUMES FROM YOUR SPEAKERS
    const [exampleMinValue, exampleMaxValue] = getParamMinMax(exampleMinMaxParam);
    console.log('Min value:', exampleMinValue, 'Max value:', exampleMaxValue);
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

function playAudio(force) { // 变量名改为 force，更贴合逻辑
    if (!dspNode) {
        return;
    }
    if (audioContext.state === 'suspended') {
        // 如果音频上下文暂停，尝试恢复（通常需要用户手势才能恢复）
        audioContext.resume();
        return;
    }

    // 核心修改：将计算出的 force 值设置给 DSP 的 wind/force 参数
    // 请根据您的 Faust 代码实际参数地址修改 "/wind/wind/force"
    const paramAddress = "/wind/wind/force";

    // 1. 设置参数
    dspNode.setParamValue(paramAddress, force);

    // 2. 额外：确保声音在 rotationSpeed > 0 时能被听到
    // 如果您的 brass 模型需要一个恒定的 pressure 来持续发声，可以设置一个基础值
    // dspNode.setParamValue("/brass/blower/pressure", 0.5); 

    console.log(`Force set to: ${force} at address: ${paramAddress}`);
}

//==========================================================================================
// END
//==========================================================================================