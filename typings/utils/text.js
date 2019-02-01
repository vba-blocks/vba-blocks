export const BY_LINE = /(?:\r\n|\r|\n)/g;
export function truncate(value, len) {
    if (value.length < len)
        return value;
    let chars = 0;
    let index = 0;
    while (chars < len && index < value.length) {
        const code = value.charCodeAt(index);
        if (code >= 32 && code <= 126)
            chars++;
        index++;
    }
    return `${value.slice(0, index)}...`;
}
export function joinCommas(values) {
    if (values.length < 3)
        return values.join(' and ');
    const last = values.pop();
    return `${values.join(', ')}, and ${last}`;
}
export function capitalize(value) {
    return value[0].toUpperCase() + value.substr(1);
}
