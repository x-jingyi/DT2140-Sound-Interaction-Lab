//==========================================================================================
// AUDIO SETUP
//==========================================================================================
let dspNode = null;
let dspNodeParams = null;
let jsonParams = null;

// Change to your wind DSP
const dspName = "wind";
const instance = new FaustWasm2ScriptProcessor(dspName);

if (typeof module === "undefined") {
    window[dspName] = instance;
} else {
    const exp = {};
    exp[dspName] = instance;
    module.exports = exp;
}

wind.createDSP(audioContext, 1024)
    .then(node => {
        dspNode = node;
        dspNode.connect(audioContext.destination);

        const jsonString = dspNode.getJSON();
        jsonParams = JSON.parse(jsonString)["ui"][0]["items"];
        dspNodeParams = jsonParams;
    });


//==========================================================================================
// DEVICE ORIENTATION LISTENER
// （核心：持续监听手机旋转）
//==========================================================================================

if (window.DeviceOrientationEvent) {
    window.addEventListener("deviceorientation", (event) => {
        const rotx = event.alpha || 0;
        const roty = event.beta || 0;
        const rotz = event.gamma || 0;

        rotationChange(rotx, roty, rotz);
    }, true);
}


//==========================================================================================
// UTILITY
//==========================================================================================

// 泛用 map 函数
function map(value, in_min, in_max, out_min, out_max, clamp = false) {
    let v = (value - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    if (clamp) v = Math.max(out_min, Math.min(out_max, v));
    return v;
}


//==========================================================================================
// INTERACTION: ROTATION LOGIC
// （你关心的部分）
//==========================================================================================

function rotationChange(rotx, roty, rotz) {
    if (!statusLabels || !statusLabels[1]) return;

    // --- 1. 改变标签颜色（根据角度动态变化） ---
    const absRot = Math.abs(roty);   // 平放时旋转最稳定
    const hue = map(absRot, 0, 360, 330, 350, true); // 粉色区间
    statusLabels[1].style("color", `hsl(${hue},100%,70%)`);

    // --- 2. 将旋转映射为风力大小 ---
    const minForce = 0.01;
    const maxForce = 1.0;
    const forceValue = map(absRot, 0, 360, minForce, maxForce, true);

    // --- 3. 调用声音 ---
    playAudio(forceValue);
}


//==========================================================================================
// AUDIO CONTROL
//==========================================================================================

function playAudio(force) {
    if (!dspNode) return;

    // 必须在用户触屏**之后**才能启用声音（浏览器策略）
    if (audioContext.state === "suspended") {
        audioContext.resume();
    }

    dspNode.setParamValue("/wind/wind/force", force);
}


//==========================================================================================
// OTHER EVENTS (DISABLED)
//==========================================================================================

function accelerationChange(accx, accy, accz) { }
function mousePressed() { }
function deviceMoved() {
    movetimer = millis();
    statusLabels[2].style("color", "pink");
}
function deviceTurned() { }
function deviceShaken() {
    shaketimer = millis();
    statusLabels[0].style("color", "pink");
}

function getMinMaxParam(address) {
    const exampleMinMaxParam = findByAddress(dspNodeParams, address);
    const [exampleMinValue, exampleMaxValue] = getParamMinMax(exampleMinMaxParam);
    return [exampleMinValue, exampleMaxValue];
}

//==========================================================================================
// END
//==========================================================================================
