
export function notNull<T>(t?: T): T {
    if (!t) {
        throw new Error("null value");
    }
    return t;
}

export function castToMap<T,K>(object: any): Map<T,K> {
    return  new Map(Object.entries(object).map(([t,k])=>[t as unknown as T, k as K]))
}

export const join = (...classes: (string | undefined)[]): string => {
    return classes.filter((c) => c !== undefined).join(" ");
};

export function getOrCreate<K, V>(map: Map<K, V>, key: K, supplier: (key: K) => V) {
    let value = map.get(key);
    if (!value) map.set(key, value = supplier(key))
    return value
}