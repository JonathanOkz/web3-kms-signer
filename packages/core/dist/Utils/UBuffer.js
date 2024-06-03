"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UBuffer = void 0;
class UBuffer {
    static bufferOrHex(input) {
        return (input instanceof Buffer) ? input : Buffer.from(input.replace('0x', ''), 'hex');
    }
}
exports.UBuffer = UBuffer;
//# sourceMappingURL=UBuffer.js.map