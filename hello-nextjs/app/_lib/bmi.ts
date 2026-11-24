export function calcBmi(height: number, weight: number): number {
    const height_m = height / 100;
    return weight / (height_m ** 2);
}