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

    // check if it's the first time to point straight up
    if (isPointingToSky && !isInSkyPosition) {

        isInSkyPosition = true;

        if (!isEngineRunning) {
            // start the engine at the first time 
            isEngineRunning = true;
            if (dspNode) {
                dspNode.setParamValue("/engine/gate", 1);
                dspNode.setParamValue("/engine/maxSpeed", maxSpeedValue);
                console.log("Engine Started! Initial Max Speed: " + maxSpeedValue);
            }
        } else {
            // add maxSpeedValue for the next time
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
    // check whether leave the 85°-90°
    else if (!isPointingToSky && isInSkyPosition) {
        // if leave
        isInSkyPosition = false; // set to false for the next time enter
        console.log("Left Sky Position. Ready for next boost.");
    }
}

/*let mouseClickToggle = true; // true = 模拟指向天空 (进入)

function mousePressed() {
    // 确保点击时恢复音频上下文 (在许多浏览器中是必要的)
    if (typeof audioContext !== 'undefined' && audioContext.state === 'suspended') {
        audioContext.resume();
        console.log("--- 1. AUDIO DEBUG: Audio Context resumed ---");
    }

    if (mouseClickToggle) {
        // --- 模拟：进入天空区域 (rotx = 90) ---

        // 逻辑判断：isPointingToSky = true && !isInSkyPosition
        if (!isInSkyPosition) {
            isInSkyPosition = true;
            console.log(`--- 2. INTERACTION DEBUG: Entering Sky Position (isInSkyPosition: ${isInSkyPosition}) ---`);

            if (!isEngineRunning) {
                // 启动引擎
                isEngineRunning = true;
                if (dspNode) {
                    // ACTION: Gate=1, MaxSpeed=0.1
                    dspNode.setParamValue("/engine/gate", 1);
                    dspNode.setParamValue("/engine/maxSpeed", maxSpeedValue);
                    console.log(`--- 3a. ACTION: Engine Started! Initial Max Speed: ${maxSpeedValue} ---`);
                } else {
                    console.log("--- DSP NODE NOT READY ---");
                }
            } else {
                // 加速
                if (maxSpeedValue < MAX_SPEED_LIMIT) {
                    maxSpeedValue = Math.min(maxSpeedValue + 0.05, MAX_SPEED_LIMIT);
                    if (dspNode) {
                        // ACTION: MaxSpeed 增加
                        dspNode.setParamValue("/engine/maxSpeed", maxSpeedValue);
                        const currentDspMaxSpeed = dspNode.getParamValue("/engine/maxSpeed");
                        console.log(`--- 3b. ACTION: Max Speed Increased! DSP Value: ${currentDspMaxSpeed.toFixed(2)} (Target: ${maxSpeedValue.toFixed(2)}) ---`);
                    }
                } else {
                    console.log("--- 3c. ACTION: Max Speed is already at the limit: " + MAX_SPEED_LIMIT + " ---");
                }
            }
        } else {
            console.log("--- 2. INTERACTION DEBUG: Already in Sky Position, no trigger ---");
        }

    } else {
        // --- 模拟：离开天空区域 (rotx != 90) ---

        // 逻辑判断：!isPointingToSky && isInSkyPosition
        if (isInSkyPosition) {
            // 手机离开了天空区域 -> 复位
            isInSkyPosition = false;
            console.log(`--- 4. RESET DEBUG: Left Sky Position (isInSkyPosition: ${isInSkyPosition}). Ready for next boost. ---`);
        } else {
            console.log("--- 4. RESET DEBUG: Already out of Sky Position. ---");
        }
    }

    // 切换状态，让下次点击执行不同的逻辑
    mouseClickToggle = !mouseClickToggle;
    console.log(`--- 5. TOGGLE: Next click will simulate ${mouseClickToggle ? 'ENTERING' : 'LEAVING'} Sky Position. ---`);
}
*/
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

//==========================================================================================
// END
//==========================================================================================