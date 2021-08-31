export default function templatizer(to, from) {

    for (const n in from) {
        if (typeof to[n] != 'object') {
            to[n] = from[n];
        } else if (typeof from[n] == 'object') {
            to[n] = templatizer(to[n], from[n]);
        }
    }
    return to;
};