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
let isEngineRunning = false;
let maxSpeedValue = 0.1;
const MAX_SPEED_LIMIT = 0.5;
let isInSkyPosition = false;

// Change here to ("tuono") depending on your wasm file name
const dspName = "engine";
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
engine.createDSP(audioContext, 1024)
    .then(node => {
        dspNode = node;
        dspNode.connect(audioContext.destination);
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
    const angleThreshold = 5;
    const isPointingToSky = Math.abs(rotx - 90) <= angleThreshold;

    // --- 步骤 1: 检查是否首次进入天空区域 ---
    if (isPointingToSky && !isInSkyPosition) {
        // 触发一次 "指向天空" 事件
        isInSkyPosition = true; // 标记：我们现在在天空区域内

        if (!isEngineRunning) {
            // 第一次指向天空：启动引擎
            isEngineRunning = true;
            if (dspNode) {
                dspNode.setParamValue("/engine/gate", 1);
                dspNode.setParamValue("/engine/maxSpeed", maxSpeedValue);
                console.log("Engine Started! Initial Max Speed: " + maxSpeedValue);
            }
        } else {
            // 后续指向天空：增加 maxSpeedValue
            if (maxSpeedValue < MAX_SPEED_LIMIT) {
                maxSpeedValue = Math.min(maxSpeedValue + 0.05, MAX_SPEED_LIMIT);
                if (dspNode) {
                    dspNode.setParamValue("/engine/maxSpeed", maxSpeedValue);
                    console.log("Max Speed Increased to: " + maxSpeedValue);
                }
            } else {
                console.log("Max Speed is already at the limit: " + MAX_SPEED_LIMIT);
            }
        }
    }
    // --- 步骤 2: 检查是否离开天空区域（复位逻辑） ---
    else if (!isPointingToSky && isInSkyPosition) {
        // 手机离开了天空区域
        isInSkyPosition = false; // 允许下次再次进入时触发事件
        console.log("Left Sky Position. Ready for next boost.");
    }
}

function mousePressed() {
    // playAudio()
    // Use this for debugging from the desktop!
}

function deviceMoved() {
    //movetimer = millis();
    //statusLabels[2].style("color", "pink");
}

function deviceTurned() {
    threshVals[1] = turnAxis;
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

// playAudio 函数不再需要，因为 rotationChange 直接控制了引擎的启动和速度。


//==========================================================================================
// END
//==========================================================================================