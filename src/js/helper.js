/**
 * @method Number.prototype.getRandomInt
 * @descriptions creates a random number between two boundaries
 * @param min
 * @param max
 * @returns {*}
 */

Number.prototype.getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * @method Number.prototype.map
 * @descriptions maps a number from one range to another range
 * @param inMin
 * @param inMax
 * @param outMin
 * @param outMax
 * @returns {number}
 */

Number.prototype.map = function (inMin, inMax, outMin, outMax) {
    return (this - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
};

/**
 * @method String.prototype.isNumeric
 * @descriptions checks if string is a number or german number
 * @returns {boolean}
 */

String.prototype.isNumeric = function () {
    return !isNaN(parseFloat(this)) && isFinite(this) || this.isNumericGerman();
};

/**
 * @method String.prototype.isNumericGerman
 * @description checks if string is a german number, for example 0,9 or 9999,999
 * @returns {boolean}
 */

String.prototype.isNumericGerman = function () {
    const tmp = this.split(",");
    return tmp.length === 2 && tmp[0].isNumeric() && tmp[0].isNumeric();
};

/**
 * @method String.prototype.isDate
 * @description recognizes following date formats
 *   YYYY.MM.DD
 *   YYYY-MM-DD
 *   YYYY/MM/DD
 *   DD.MM.YYYY
 *   DD-MM-YYYY
 *   DD/MM/YYYY
 *   MM.DD.YYYY
 *   MM-DD-YYYY
 *   MM/DD/YYYY
 * @return {boolean}
 */

String.prototype.isDate = function () {
    let YYYYMMDD = /^\d{4}[\/\-.](0?[1-9]|1[012])[\/\-.](0?[1-9]|[12][0-9]|3[01])$/;
    let DDMMYYYY = /^(0?[1-9]|[12][0-9]|3[01])[\/\-.](0?[1-9]|1[012])[\/\-.]\d{4}$/;
    let MMDDYYYY = /^(0?[1-9]|1[012])[\/\-.](0?[1-9]|[12][0-9]|3[01])[\/\-.]\d{4}$/;
    return YYYYMMDD.test(this) || DDMMYYYY.test(this) || MMDDYYYY.test(this);
};

/**
 * @method Array.prototype.getNominalBoundaries
 * @descriptions Calculates the amount of unique nominal values in an array and returns the unique-counter-dictionary, as well as the pure values
 * @param selection {Object}
 * @param both {Boolean} Tells the function to use both axis i.o. to save calculation time because only one loop is needed
 * @param type {String} this parameter is only used if both = false and it tells the function which axis to use(x or y);
 * @returns {Object}
 */
Array.prototype.getNominalBoundaries = function (selection, both, type = undefined) {

    let unique, result;

    let getUniqueElements = function (selection, both) {
        let dict = {};

        if (both) {

            dict.x = {};
            dict.y = {};

            for (let i = 0; i < this.length; i++) {
                dict.x[this[i][selection.x]] = ++dict.x[this[i][selection.x]] || 1;
                dict.y[this[i][selection.y]] = ++dict.y[this[i][selection.y]] || 1;
            }

        } else {

            for (let i = 0; i < this.length; i++) {
                dict[this[i][selection]] = ++dict[this[i][selection]] || 1;
            }

        }

        return dict;
    };

    if (both) {
        unique = getUniqueElements.call(this, selection, true);
        result = {
            minX: 0,
            maxX: Object.keys(unique.x).length,
            minY: 0,
            maxY: Object.keys(unique.y).length,
            uniqueX: unique.x,
            uniqueY: unique.y
        };
    }
    else {

        unique = getUniqueElements.call(this, selection, false);
        if (type === "x") {
            result = {
                minX: 0,
                maxX: Object.keys(unique).length,
                uniqueX: unique
            };
        } else {
            result = {
                minY: 0,
                maxY: Object.keys(unique).length,
                uniqueY: unique
            };
        }

    }
    return result;
};


/**
 * @method Array.prototype.getNumericalBoundaries
 * @descriptions Calculates min and max values of axis
 * @param features {Object}
 * @param both {Boolean} Tells the function to use both axis i.o. to save calculation time because only one loop is needed
 * @param type {String} this parameter is only used if both = false and it tells the function which axis to use(x or y);
 * @returns {Object}
 */
Array.prototype.getNumericalBoundaries = function (features, both, type = undefined) {
    let result;
    if (both) {

        let maxValueX = -Infinity, minValueX = Infinity;
        let maxValueY = -Infinity, minValueY = Infinity;

        for (let i = 0; i < this.length; i++) {
            let x = parseFloat(this[i][features.x]);
            let y = parseFloat(this[i][features.y]);

            if (x > maxValueX) {
                maxValueX = x;
            } else if (x < minValueX) {
                minValueX = x;
            }

            if (y > maxValueY) {
                maxValueY = y;
            } else if (y < minValueY) {
                minValueY = y;
            }
        }

        result = {
            minX: minValueX,
            maxX: maxValueX,
            minY: minValueY,
            maxY: maxValueY
        };

    } else {

        let maxValue = -Infinity, minValue = Infinity, i, current;

        if (type === "x") {

            for (i = 0; i < this.length; i++) {
                current = parseFloat(this[i][features.x]);
                if (current > maxValue) {
                    maxValue = current;
                }

                if (current < minValue) {
                    minValue = current;
                }
            }

            result = {
                minX: minValue,
                maxX: maxValue
            };

        } else {

            for (i = 0; i < this.length; i++) {
                current = parseFloat(this[i][features.y]);
                if (current > maxValue) {
                    maxValue = current;
                }
                if (current < minValue) {
                    minValue = current;
                }
            }

            result = {
                minY: minValue,
                maxY: maxValue
            };

        }
    }

    return result;

};

Array.prototype.sortBy = function (feature, attribute) {
    let type;
    let cellToCheck = attribute ? this[0][attribute][feature] : this[0][feature];

    if (cellToCheck.isNumeric()) {
        type = "numeric";
    }
    else if (cellToCheck.isDate()) {
        type = "date";
    }
    else {
        type = "nominal";
    }

    if (type === "numeric") {
        if (attribute) {
            this.sort((a, b) => a[attribute][feature] - b[attribute][feature]);
        } else {
            this.sort((a, b) => a[feature] - b[feature]);
        }
    } else if (type === "date") {

        if (attribute) {
            this.sort(function (a, b) {
                a = a[attribute][feature].split(".");
                b = b[attribute][feature].split(".");
                return new Date(a[2], a[1], a[0]) - new Date(b[2], b[1], b[0]);
            });
        } else {
            this.sort(function (a, b) {
                a = a[feature].split(".");
                b = b[feature].split(".");
                return new Date(a[2], a[1], a[0]) - new Date(b[2], b[1], b[0]);
            });
        }

    } else {
        let value1, value2;

        if (attribute) {
            this.sort(function (a, b) {
                value1 = a[attribute][feature].toUpperCase();
                value2 = b[attribute][feature].toUpperCase();
                if (value1 < value2) {
                    return -1;
                }
                if (value1 > value2) {
                    return 1;
                }
                return 0;
            });
        } else {
            this.sort(function (a, b) {
                value1 = a[feature].toUpperCase();
                value2 = b[feature].toUpperCase();
                if (value1 < value2) {
                    return -1;
                }
                if (value1 > value2) {
                    return 1;
                }
            });
        }

    }
};

String.prototype.toHex = function () {
    return parseInt(this.replace("#", ""), 16);
};


/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 * Source: http://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
 *
 * @return  {Number}          The Hex representation
 */

Array.prototype.HSLToHex = function () {
    var r, g, b;

    if (this[1] === 0) {
        r = g = b = this[2]; // achromatic
    } else {
        var q = this[2] < 0.5 ? this[2] * (1 + this[1]) : this[2] + this[1] - this[2] * this[1];
        var p = 2 * this[2] - q;
        r = hue2rgb(p, q, this[0] + 1 / 3);
        g = hue2rgb(p, q, this[0]);
        b = hue2rgb(p, q, this[0] - 1 / 3);
    }

    // -1 because we start at 0 not at 1
    return Math.round(r * 256) * 256 * 256 + Math.round(g * 256) * 256 + Math.round(b * 256) - 1;
};

var hue2rgb = function (p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
};

/**
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 * Source: http://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
 *
 * @this    {String}          z.B. "#FFBBAA" or "001123"
 * @return  {Array}           The HSL representation
 */

String.prototype.RGBToHSL = function () {
    let string = this.replace("#", "");
    let r = parseInt(string.slice(0, 2), 16);
    let g = parseInt(string.slice(2, 4), 16);
    let b = parseInt(string.slice(4, 6), 16);
    r /= 255;
    g /= 255;
    b /= 255;

    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if (max == min) {
        h = s = 0; // achromatic
    } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }

    return [h, s, l];
};

