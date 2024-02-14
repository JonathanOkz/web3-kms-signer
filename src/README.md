
# Web3 KMS Signer Library

The Web3 KMS Signer Library provides an efficient way to sign Ethereum transactions and messages using private keys managed by Key Management Services (KMS) like AWS and GCP, as well as supporting Hierarchical Deterministic (HD) wallets. It simplifies the complexities associated with transaction serialization and signature generation, facilitating the creation of secure and blockchain-compliant transactions.

Refer to this article for a more in-depth understanding : https://jonathanokz.medium.com/secure-an-ethereum-wallet-with-a-kms-provider-2914bd1e4341

## Features

- Sign Ethereum transactions and arbitrary messages.
- Support for KMS wallets (AWS KMS, GCP KMS) and HD wallets.
- Network-specific transaction signing for compatibility across different Ethereum networks (support EIP-155 signatures).

## Installation

Install the Web3 KMS Signer Library using npm :

```bash
npm install web3-kms-signer
```

## Usage

### Setting Up

Set up the right `Provider` instance before signing transactions or messages. Choose a wallet type based on your requirements, such as KMS-based wallets or Hierarchical Deterministic (HD) wallets.

#### KMS Wallets

##### Using AWS KMS :

```javascript
import { KMSProvider } from "web3-kms-signer";

const awsConfig = {
    region: 'us-east-1',
    credentials: {
        accessKeyId: 'YOUR_AWS_ACCESS_KEY_ID',
        secretAccessKey: 'YOUR_AWS_SECRET_ACCESS_KEY'
    }
};

const provider = new KMSProvider.AWS(awsConfig);

// If you haven't created keys in AWS KMS yet, proceed according below :
// This will create a new asymmetric signing key with the right settings.
// It's with this `keyId` that you will be able to sign transactions and messages after.
const keyId = await provider.createKey();
```

##### Using GCP KMS :

```javascript
import { KMSProvider } from "web3-kms-signer";

const gcpConfig = {
    keyFilename: "path/to/your/gcp/keyfile.json"
};
const provider = new KMSProvider.GCP(gcpConfig);

// If you haven't created key ring in GCP KMS yet, proceed according below :
// This step is required only once before beginning; afterwards, you'll just need the `key-ring-id`.
const keyRing = await provider.createKeyRing("key-ring-id");

provider.setPath(
        projectId: "your-gcp-project-id",
        locationId: "your-gcp-location-id",
        keyRingId: keyRing
    });

// If you haven't created keys in GCP KMS yet, proceed according below :
// This will create a new asymmetric signing key with the right settings.
// It's with this `keyId` that you will be able to sign transactions and messages after.
const keyId = await provider.createKey();
```

#### HD Wallets

```javascript
import { HDProvider, UBIP44 } from "web3-kms-signer";

const mnemonic = "your mnemonic phrase here";
const provider = new HDProvider.NodeWallet(mnemonic);

// With HD Wallets `KeyId` is the derivation path
const keyId = "m/44'/0'/0'/0/1"

// For easier use, this library provide a utility function.
// Please see various use cases below :
const keyId = UBIP44.keyId("4-67"); // => "m/44'/0'/4'/0/67"
const keyId = UBIP44.keyId("67"); // => "m/44'/0'/0'/0/67"
const keyId = UBIP44.keyId({account: 4, index: 67}); // => "m/44'/0'/4'/0/67"
const keyId = UBIP44.keyId({index: 67}); // => "m/44'/0'/0'/0/67"
```

### Signing Transactions

Then set up the `HDWallets` and `Signer` instance.

```javascript
import { HDWallets, Signer } from "web3-kms-signer";

const chainId = 3; // Ropsten
const wallets = new HDWallets(provider);
const signer = new Signer(wallets, chainId);

const txData = {
    nonce: '0x00', // Replace with actual nonce
    gasPrice: '0x09184e72a000', // Replace with actual gas price
    gasLimit: '0x2710', // Replace with actual gas limit
    to: '0x0000000000000000000000000000000000000000', // Replace with recipient address
    value: '0x00', // Amount to send
    data: '0x0', // Data payload if any
};

const signedTx = await signer.signTransaction({ KeyId: 'keyId' }, txData);
// Now you can send this signed transaction through Blockchain
```

### Signing Messages

```javascript
import { HDWallets, Signer } from "web3-kms-signer";

const wallets = new HDWallets(provider);
const signer = new Signer(wallets);

const message = "hello world !";
const signedMessage = await signer.signMessage({ KeyId: 'keyId' }, message);
console.log(signedMessage);
// You now have a signed message which can be verified on-chain
```

## Complete implementation

#### KMS Wallets

##### Using AWS KMS:

```javascript
import { KMSProvider, HDWallets, Signer } from "web3-kms-signer";
import  web3  from  "web3";

// setup provider
const awsConfig = {
    region: 'us-east-1',
    credentials: {
        accessKeyId: 'YOUR_AWS_ACCESS_KEY_ID',
        secretAccessKey: 'YOUR_AWS_SECRET_ACCESS_KEY'
    }
};
const provider = new KMSProvider.AWS(awsConfig);

const chainId = 3; // Ropsten
const wallets = new HDWallets(provider);
const signer = new Signer(wallets, chainId);

const txData = {
    nonce: '0x00', // Replace with actual nonce
    gasPrice: '0x09184e72a000', // Replace with actual gas price
    gasLimit: '0x2710', // Replace with actual gas limit
    to: '0x0000000000000000000000000000000000000000', // Replace with recipient address
    value: '0x00', // Amount to send
    data: '0x0', // Data payload if any
};

const signedTx = await signer.signTransaction({ KeyId: 'aws keyId' }, txData);

web3.eth.sendSignedTransaction(signedTx)
.on('confirmation', (confirmationNumber : number, receipt : any) => {
	console.log("confirmation: " + confirmationNumber);
}).on('receipt', (txReceipt : any) => {
	console.log("signAndSendTx txReceipt. Tx Address: " + txReceipt.transactionHash);
}).on('error', error  => {
	console.error("error: " + error);
});
```

##### Using GCP KMS:

```javascript
import { KMSProvider, HDWallets, Signer } from "web3-kms-signer";
import  web3  from  "web3";

const gcpConfig = {
    keyFilename: 'path/to/your/gcp/keyfile.json'
};
const provider = new KMSProvider.GCP(gcpConfig);
provider.setPath(
        projectId: 'your-gcp-project-id',
        locationId: 'your-gcp-location-id',
        keyRingId: 'key-ring-id'
    });

const chainId = 3; // Ropsten
const wallets = new HDWallets(provider);
const signer = new Signer(wallets, chainId);

const txData = {
    nonce: '0x00', // Replace with actual nonce
    gasPrice: '0x09184e72a000', // Replace with actual gas price
    gasLimit: '0x2710', // Replace with actual gas limit
    to: '0x0000000000000000000000000000000000000000', // Replace with recipient address
    value: '0x00', // Amount to send
    data: '0x0', // Data payload if any
};

const signedTx = await signer.signTransaction({ KeyId: 'gcp keyId' }, txData);

web3.eth.sendSignedTransaction(signedTx)
.on('confirmation', (confirmationNumber : number, receipt : any) => {
	console.log("confirmation: " + confirmationNumber);
}).on('receipt', (txReceipt : any) => {
	console.log("signAndSendTx txReceipt. Tx Address: " + txReceipt.transactionHash);
}).on('error', error  => {
	console.error("error: " + error);
});
```

#### HD Wallets

```javascript
import { KMSProvider, HDWallets, Signer } from "web3-kms-signer";
import  web3  from  "web3";

const mnemonic = "your mnemonic phrase here";
const provider = new HDProvider.NodeWallet(mnemonic);

const chainId = 3; // Ropsten
const wallets = new HDWallets(provider);
const signer = new Signer(wallets, chainId);

const txData = {
    nonce: '0x00', // Replace with actual nonce
    gasPrice: '0x09184e72a000', // Replace with actual gas price
    gasLimit: '0x2710', // Replace with actual gas limit
    to: '0x0000000000000000000000000000000000000000', // Replace with recipient address
    value: '0x00', // Amount to send
    data: '0x0', // Data payload if any
};

const signedTx = await signer.signTransaction({ KeyId: 'derivation path' }, txData);

web3.eth.sendSignedTransaction(signedTx)
.on('confirmation', (confirmationNumber : number, receipt : any) => {
	console.log("confirmation: " + confirmationNumber);
}).on('receipt', (txReceipt : any) => {
	console.log("signAndSendTx txReceipt. Tx Address: " + txReceipt.transactionHash);
}).on('error', error  => {
	console.error("error: " + error);
});
```

## Contributing

Contributions from the community are welcome ! For improvements or bug fixes, please submit a pull request or open an issue in the GitHub repository.

## License

This project is licensed under the MIT License - see the LICENSE file for details.