var state = (function(state) {
    state[state["Duplicate"] = 1062] = "Duplicate";
    state[state["OverSize"] = 1406] = "OverSize";
    state[state["TooShort"] = 3400] = "TooShort";
    state[state["NotCorrect"] = 3500] = "NotCorrect";
    state[state["NotExist"] = 3600] = "NotExist";
    state[state["Empty"] = 3700] = "Empty";
    return state;
})(state || (state = {}));

class State {
    constructor(message) {

    }
}

Object.assign(State, state);

module.exports = State;
