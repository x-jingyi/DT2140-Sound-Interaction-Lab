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
    const currentRotationZ = rotationZ;
    const currentTime = millis();

    if (lastTime > 0) {

        let angleDelta = currentRotationZ - lastRotationZ;

        // Make the rotation angel continuous
        if (angleDelta > 180) {
            angleDelta -= 360;
        } else if (angleDelta < -180) {
            angleDelta += 360;
        }

        // take the absolute value(ignore direction)
        const absAngleDelta = Math.abs(angleDelta);

        // calculate deltaTime
        const deltaTime = currentTime - lastTime; // millisecond

        // calculate rotate speed (Speed = Delta Angle / Delta Time)
        // use a small threshold to avoid divison by 0
        let rotationSpeed = 0;
        if (deltaTime > 10) {
            rotationSpeed = absAngleDelta / (deltaTime / 1000);
        }

        // map speed to force
        const maxExpectedSpeed = 270;
        let force = map(rotationSpeed, 0, maxExpectedSpeed, 0, MAX_FORCE);
        force = constrain(force, 0, MAX_FORCE);

        if (rotationSpeed > 5) { // small threshold

            playAudio(force); // play audio with force value
        } else {
            // when rotation stop
            playAudio(0);
        }
        console.log(`Speed: ${rotationSpeed.toFixed(2)} deg/s, Force: ${force.toFixed(2)}`);

    }

    // update data
    lastRotationZ = currentRotationZ;
    lastTime = currentTime;
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

function playAudio(force) {
    if (!dspNode) {
        return;
    }
    if (audioContext.state === 'suspended') {
        audioContext.resume();
        return;
    }

    // set the force value to wind
    const paramAddress = "/wind/wind/force";

    dspNode.setParamValue(paramAddress, force);
}

//==========================================================================================
// END
//==========================================================================================