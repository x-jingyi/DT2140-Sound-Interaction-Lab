//==========================================================================================
// COMPLETE FIXED SCRIPT (map -> mapRange, Math.abs, millis compatibility)
//==========================================================================================
let dspNode = null;
let dspNodeParams = null;
let jsonParams = null;

// If your environment already has an audioContext variable, keep using it.
// Otherwise ensure audioContext is created elsewhere before this script runs.
const dspName = "wind";
const instance = new FaustWasm2ScriptProcessor(dspName);

if (typeof module === "undefined") {
    window[dspName] = instance;
} else {
    const exp = {};
    exp[dspName] = instance;
    module.exports = exp;
}

// create DSP (assumes `wind` is available in scope)
if (typeof wind !== "undefined" && typeof audioContext !== "undefined") {
    wind.createDSP(audioContext, 1024)
        .then(node => {
            dspNode = node;
            dspNode.connect(audioContext.destination);
            const jsonString = dspNode.getJSON();
            try {
                jsonParams = JSON.parse(jsonString)["ui"][0]["items"];
                dspNodeParams = jsonParams;
            } catch (e) {
                // JSON parse failed — keep params null
                dspNodeParams = null;
            }
        })
        .catch(err => {
            console.warn("Could not create DSP node:", err);
        });
} else {
    console.warn("wind or audioContext is not defined in this environment.");
}

//==========================================================================================
// DEVICE ORIENTATION LISTENER
//==========================================================================================
if (window && window.DeviceOrientationEvent) {
    window.addEventListener("deviceorientation", (event) => {
        const rotx = (typeof event.alpha === "number") ? event.alpha : 0; // z axis
        const roty = (typeof event.beta === "number") ? event.beta : 0;   // x axis
        const rotz = (typeof event.gamma === "number") ? event.gamma : 0; // y axis
        rotationChange(rotx, roty, rotz);
    }, true);
}

//==========================================================================================
// UTILITY (rename map -> mapRange to avoid p5 conflict)
//==========================================================================================

/**
 * mapRange(value, in_min, in_max, out_min, out_max, clamp=false)
 * Like p5.map but renamed to avoid conflicts with p5.js global `map`.
 */
function mapRange(value, in_min, in_max, out_min, out_max, clamp = false) {
    // Protect against division by zero
    if (in_max === in_min) return out_min;
    let v = (value - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    if (clamp) {
        if (out_min < out_max) {
            v = Math.max(out_min, Math.min(out_max, v));
        } else {
            v = Math.max(out_max, Math.min(out_min, v));
        }
    }
    return v;
}

// millis compatibility: if p5 provides millis(), use it; otherwise use Date.now()
function safeMillis() {
    if (typeof millis === "function") return millis();
    return Date.now();
}

//==========================================================================================
// INTERACTION: ROTATION LOGIC
//==========================================================================================
function rotationChange(rotx, roty, rotz) {
    // statusLabels is expected to be defined in your environment (p5 or DOM)
    if (typeof statusLabels === "undefined" || !statusLabels || !statusLabels[1]) {
        // If no statusLabels, still map audio so wind effect can be heard
        handleRotationAudio(roty);
        return;
    }

    // Use Math.abs instead of abs to avoid p5 global usage
    const absRot = Math.abs(roty);

    // --- 1) Change label color dynamically (pink-ish) ---
    // Choose a small H range inside pink tones: tweak as you like
    // We'll map rotation 0..360 -> hue 330..350 (pink)
    const hue = mapRange(absRot, 0, 360, 330, 350, true);
    // If statusLabels elements are D3-like or p5 DOM, keep .style; otherwise try direct DOM
    try {
        statusLabels[1].style("color", `hsl(${hue},100%,70%)`);
    } catch (e) {
        // fallback if statusLabels is a DOM element collection:
        try {
            if (statusLabels[1].style) {
                statusLabels[1].style.color = `hsl(${hue},100%,70%)`;
            }
        } catch (ee) {
            // ignore styling errors
        }
    }

    // --- 2) Map rotation to wind force ---
    const minForce = 0.01;
    const maxForce = 1.0;
    const forceValue = mapRange(absRot, 0, 360, minForce, maxForce, true);

    // --- 3) Play audio with mapped force ---
    playAudio(forceValue);
}

function handleRotationAudio(roty) {
    const absRot = Math.abs(roty || 0);
    const minForce = 0.01;
    const maxForce = 1.0;
    const forceValue = mapRange(absRot, 0, 360, minForce, maxForce, true);
    playAudio(forceValue);
}

//==========================================================================================
// AUDIO CONTROL
//==========================================================================================
function playAudio(force) {
    if (!dspNode) {
        // DSP not ready yet
        return;
    }

    // Modern browsers require a user interaction to unlock audio.
    // We try to resume the audioContext if it's suspended.
    try {
        if (typeof audioContext !== "undefined" && audioContext.state === "suspended") {
            audioContext.resume().catch(() => {
                // resume may fail if no user gesture — that's expected behavior
            });
        }
    } catch (e) {
        // ignore audioContext resume errors
    }

    // Finally set the parameter if dspNode supports it
    try {
        if (typeof dspNode.setParamValue === "function") {
            dspNode.setParamValue("/wind/wind/force", force);
        } else {
            // fallback: try to find param setter form
            if (dspNode.params && dspNode.params["/wind/wind/force"]) {
                // some DSP wrappers expose params object
                dspNode.params["/wind/wind/force"].value = force;
            }
        }
    } catch (e) {
        console.warn("Failed to set DSP parameter
