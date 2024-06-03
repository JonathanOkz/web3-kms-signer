"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Wallets = void 0;
const UAddress_1 = require("./Utils/UAddress");
/**
 * The Wallets abstract class defines a standard interface for cryptocurrency wallets,
 * encompassing key management, digital signature generation, and address retrieval.
 *
 */
class Wallets {
    /**
     * Retrieves the address associated with a given key identifier.
     * @param keyId The identifier for the key.
     * @returns Promise that resolves to the address as a Buffer.
     */
    async getAddress(keyId) {
        return UAddress_1.UAddress.fromPublickey(await this.getPublickey(keyId)).getAddress();
    }
    /**
     * Retrieves the hexadecimal string representation of the address for a given key identifier.
     * @param keyId The identifier for the key.
     * @returns Promise that resolves to the address as a hexadecimal string.
     */
    async getAddressHex(keyId) {
        return UAddress_1.UAddress.fromPublickey(await this.getPublickey(keyId)).getAddressHex();
    }
}
exports.Wallets = Wallets;
//# sourceMappingURL=Wallets.js.map