export function decodeArray(input, Type = Uint16Array) {
    if (typeof input != "string")
        return input;
    let array = null;
    for (let pos = 0, out = 0; pos < input.length;) {
        let value = 0;
        for (;;) {
            let next = input.charCodeAt(pos++), stop = false;
            if (next == 126) {
                value = 65535;
                break;
            }
            if (next >= 92)
                next--;
            if (next >= 34)
                next--;
            let digit = next - 32;
            if (digit >= 46) {
                digit -= 46;
                stop = true;
            }
            value += digit;
            if (stop)
                break;
            value *= 46;
        }
        if (array)
            array[out++] = value;
        else
            array = new Type(value);
    }
    return array;
}
