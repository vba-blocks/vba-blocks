export default function has(value, key) {
    return !!value && Object.hasOwnProperty.call(value, key);
}
