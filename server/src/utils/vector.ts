export type Vector = number[];

export function dotProduct(vecA: Vector, vecB: Vector): number {
    if (vecA.length !== vecB.length) {
        throw new Error('Vectors must be of the same length');
    }
    return vecA.reduce((acc, val, i) => acc + val * vecB[i], 0);
}

export function magnitude(vec: Vector): number {
    return Math.sqrt(vec.reduce((acc, val) => acc + val * val, 0));
}

export function cosineSimilarity(vecA: Vector, vecB: Vector): number {
    const dot = dotProduct(vecA, vecB);
    const magA = magnitude(vecA);
    const magB = magnitude(vecB);

    if (magA === 0 || magB === 0) {
        return 0; // Or handle as an error, depending on desired behavior
    }

    return dot / (magA * magB);
}

export function averageVector(vectors: Vector[]): Vector {
    if (vectors.length === 0) {
        return [];
    }
    const vecLength = vectors[0].length;
    const sum = new Array(vecLength).fill(0);

    for (const vec of vectors) {
        for (let i = 0; i < vecLength; i++) {
            sum[i] += vec[i];
        }
    }

    return sum.map(val => val / vectors.length);
}
