export class UBIP44 {
    /**
     * Generates a BIP44 compliant key derivation path for cryptocurrency wallets.
     * 
     * This function accepts either a string or an object as input :
     * - The string input should follow the format "{account}-{index}", where both account and
     *   index are numbers. If the input does not match this format, an exception is thrown
     *   indicating a bad format error.
     * - The object input, should contain 'account' and must contain 'index'.
     *   If 'account' is not provided, it defaults to 0.
     * 
     * The function then returns a string
     * representing the key derivation path in the format "m/44'/0'/{account}'/0/{index}", where
     * 'account' and 'index' are replaced by their respective values from the input.
     * 
     * Examples:
     * - Given a string "0-1", the function returns "m/44'/0'/0'/0/1".
     * - Given an object { index: 1 }, the function returns "m/44'/0'/0'/0/1".
     * 
     * @param {string | {account?: number, index: number}} shortId - The input identifier, either a string in "account-index" format or an object with 'account' and 'index' properties.
     * @returns {string} A BIP44 compliant key derivation path.
     * @throws {string} Throws an error if the string input does not match the required format.
     */
    public static keyId(shortId: string | {account?: number, index: number}) : string {
        if (typeof shortId === 'string') {
            if (/^\d+-\d+$/.test(shortId) == true) {
                const [account, index] = shortId.split("-");
                return `m/44'/0'/${account}'/0/${index}`;
            } else if (/^\d+$/.test(shortId) == true) {
                return `m/44'/0'/0'/0/${shortId}`;
            } else {
                throw "bad shortId format : `{account}-{index}` or `{index}`";
            }
        } else {
            const account = (!shortId.account) ? 0 : shortId.account
            return `m/44'/0'/${account}'/0/${shortId.index}`;
        }
    }
}