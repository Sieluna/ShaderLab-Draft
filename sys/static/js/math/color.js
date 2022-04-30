const COLORS = {
    black: '#000000',
    white: '#ffffff',
    red: '#ff0000',
    green: '#00ff00',
    blue: '#0000ff',
    fuchsia: '#ff00ff',
    cyan: '#00ffff',
    yellow: '#ffff00',
    orange: '#ff8000',
};

// Color stored as an array of RGB decimal values (between 0 > 1)
// Constructor and set method accept following formats:
// new Color() - Empty (defaults to black)
// new Color([0.2, 0.4, 1.0]) - Decimal Array (or another Color instance)
// new Color(0.7, 0.0, 0.1) - Decimal RGB values
// new Color('#ff0000') - Hex string
// new Color('#ccc') - Short-hand Hex string
// new Color(0x4f27e8) - Number
// new Color('red') - Color name string

export class Color extends Array {
    constructor(color) {
        if (Array.isArray(color)) return super(...color);
        return super(...Color.parseColor(...arguments));
    }

    get r() {
        return this[0];
    }

    get g() {
        return this[1];
    }

    get b() {
        return this[2];
    }

    set r(v) {
        this[0] = v;
    }

    set g(v) {
        this[1] = v;
    }

    set b(v) {
        this[2] = v;
    }

    set(color) {
        if (Array.isArray(color)) return this.copy(color);
        return this.copy(Color.parseColor(...arguments));
    }

    copy(v) {
        this[0] = v[0];
        this[1] = v[1];
        this[2] = v[2];
        return this;
    }

    static hexToRGB(hex) {
        if (hex.length === 4)
            hex = hex[0] + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
        const rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (!rgb) console.warn(`Unable to convert hex string ${hex} to rgb values`);
        return [parseInt(rgb[1], 16) / 255, parseInt(rgb[2], 16) / 255, parseInt(rgb[3], 16) / 255];
    }

    static numberToRGB(num) {
        num = parseInt(num);
        return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];
    }

    static parseColor(color) {
        // Empty
        if (color === undefined) return [0, 0, 0];

        // Decimal
        if (arguments.length === 3) return arguments;

        // Number
        if (!isNaN(color)) return Color.numberToRGB(color);

        // Hex
        if (color[0] === '#') return Color.hexToRGB(color);

        // Names
        if (COLORS[color.toLowerCase()]) return Color.hexToRGB(COLORS[color.toLowerCase()]);

        console.warn('Color format not recognised');
        return [0, 0, 0];
    }
}
