export class UBuffer {
    public static bufferOrHex(input: Buffer | string) {
        return (input instanceof Buffer) ? input : Buffer.from(input.replace('0x', ''), 'hex');
    }
}