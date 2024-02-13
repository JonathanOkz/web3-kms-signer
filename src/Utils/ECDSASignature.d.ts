export interface ECDSASignature {
    v: bigint;
    r: Buffer;
    s: Buffer;
}