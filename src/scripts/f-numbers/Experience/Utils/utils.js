/*
 * Small utility functions
 */

export function degToRad(degrees) {
    return degrees * (Math.PI / 180);
}

/*
 * Type chaeck that the given variable is an array of n instances 
 * of the given class. 'n' can be None.
 * 
 * if 'cls' is provided, we test that each element is an instance
 * of that class. 
 * 
 * if 'hasAttributes' is provided, we test that each instance has
 * the given attributes.
 * 
 */
export function isArrayOfX({variable, cls, hasAttributes, n}) {
    function isInstanceValid(obj)
    {
        if (cls)
            return obj instanceof cls;
        
        if (hasAttributes)
            return  hasAttributes.every(attr => attr in obj);
        
        return true;
    }

    return Array.isArray(variable) &&
           (variable.length === n || typeof n === 'undefined' ) &&
           variable.every(item => isInstanceValid(item));
}

export function hasAttributes(obj, attributes)
{
    return attributes.every(attr => attr in obj);
}

export function rgbToHex({r, g, b}) {
    const toHex = (value) => {
        const hex = value.toString(16).padStart(2, '0');
        return hex.toUpperCase();
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}