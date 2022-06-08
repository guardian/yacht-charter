export default function contains(a, b) {

    if (Array.isArray(b)) {
        return b.some(x => a.indexOf(x) > -1);
    }

    return a.indexOf(b) > -1;
}