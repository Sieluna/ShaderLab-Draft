export const base = {
    8: "Backspace",
    9: "Tab",
    10: "Enter",
    12: "NumLock",
    13: "Enter",
    16: "Shift",
    17: "Control",
    18: "Alt",
    20: "CapsLock",
    27: "Escape",
    32: " ",
    33: "PageUp",
    34: "PageDown",
    35: "End",
    36: "Home",
    37: "ArrowLeft",
    38: "ArrowUp",
    39: "ArrowRight",
    40: "ArrowDown",
    44: "PrintScreen",
    45: "Insert",
    46: "Delete",
    59: ";",
    61: "=",
    91: "Meta",
    92: "Meta",
    106: "*",
    107: "+",
    108: ",",
    109: "-",
    110: ".",
    111: "/",
    144: "NumLock",
    145: "ScrollLock",
    160: "Shift",
    161: "Shift",
    162: "Control",
    163: "Control",
    164: "Alt",
    165: "Alt",
    173: "-",
    186: ";",
    187: "=",
    188: ",",
    189: "-",
    190: ".",
    191: "/",
    192: "`",
    219: "[",
    220: "\\",
    221: "]",
    222: "'",
    229: "q"
};
export const shift = {
    48: ")",
    49: "!",
    50: "@",
    51: "#",
    52: "$",
    53: "%",
    54: "^",
    55: "&",
    56: "*",
    57: "(",
    59: ":",
    61: "+",
    173: "_",
    186: ":",
    187: "+",
    188: "<",
    189: "_",
    190: ">",
    191: "?",
    192: "~",
    219: "{",
    220: "|",
    221: "}",
    222: "\"",
    229: "Q"
};
const chrome = typeof navigator != "undefined" && /Chrome\/(\d+)/.exec(navigator.userAgent);
const safari = typeof navigator != "undefined" && /Apple Computer/.test(navigator.vendor);
const gecko = typeof navigator != "undefined" && /Gecko\/\d+/.test(navigator.userAgent);
const mac = typeof navigator != "undefined" && /Mac/.test(navigator.platform);
const ie = typeof navigator != "undefined" && /MSIE \d|Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(navigator.userAgent);
const brokenModifierNames = chrome && (mac || +chrome[1] < 57) || gecko && mac;
for (let i = 0; i < 10; i++)
    base[48 + i] = base[96 + i] = String(i);
for (let i = 1; i <= 24; i++)
    base[i + 111] = "F" + i;
for (let i = 65; i <= 90; i++) {
    base[i] = String.fromCharCode(i + 32);
    shift[i] = String.fromCharCode(i);
}
for (let code in base)
    if (!shift.hasOwnProperty(code))
        shift[code] = base[code];
export function keyName(event) {
    let ignoreKey = brokenModifierNames && (event.ctrlKey || event.altKey || event.metaKey) || (safari || ie) && event.shiftKey && event.key && event.key.length == 1;
    let name = (!ignoreKey && event.key) || (event.shiftKey ? shift : base)[event.keyCode] || event.key || "Unidentified";
    if (name == "Esc")
        name = "Escape";
    if (name == "Del")
        name = "Delete";
    if (name == "Left")
        name = "ArrowLeft";
    if (name == "Up")
        name = "ArrowUp";
    if (name == "Right")
        name = "ArrowRight";
    if (name == "Down")
        name = "ArrowDown";
    return name;
}
