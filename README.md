
# Web3 KMS Signer Library

The Web3 KMS Signer Library provides an efficient way to sign Ethereum transactions and messages using private keys managed by Key Management Services (KMS) like AWS and GCP, as well as supporting Hierarchical Deterministic (HD) wallets. It simplifies the complexities associated with transaction serialization and signature generation, facilitating the creation of secure and blockchain-compliant transactions.

Refer to this article for a more in-depth understanding : https://jonathanokz.medium.com/secure-an-ethereum-wallet-with-a-kms-provider-2914bd1e4341

## Features

- Sign Ethereum transactions and arbitrary messages.
- Support for KMS wallets (AWS KMS, GCP KMS) and HD wallets.
- Network-specific transaction signing for compatibility across different networks (support EIP-155 signatures).

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

const kmsProvider = new KMSProvider.AWS(awsConfig);

// If you haven't yet generated keys in AWS KMS, follow the steps below to create a new asymmetric signing key with the appropriate configurations.
const keyId = await kmsProvider.createKey();
```

##### Using GCP KMS :

```javascript
import { KMSProvider } from "web3-kms-signer";

const gcpConfig = {
    keyFilename: "path/to/your/gcp/keyfile.json"
};
const kmsProvider = new KMSProvider.GCP(gcpConfig);

// If you haven't yet generated key-ring in GCP KMS, follow the steps below :
// This step is required only once before beginning; afterwards, you'll just need the `key-ring-id`.
const keyRing = await kmsProvider.createKeyRing("key-ring-id");

kmsProvider.setPath({
        projectId: "your-gcp-project-id",
        locationId: "your-gcp-location-id",
        keyRingId: keyRing
    });

// If you haven't yet generated keys in GCP KMS, follow the steps below to create a new asymmetric signing key with the appropriate configurations.
const keyId = await kmsProvider.createKey();
```

#### HD Wallets

```javascript
import { HDProvider, UBIP44 } from "web3-kms-signer";

const mnemonic = "your mnemonic phrase here";
const hdProvider = new HDProvider.NodeWallet(mnemonic);

// With HD Wallets, the `KeyId` is the derivation path, which specifies the route through which individual keys are generated from the master seed.
const keyId = "m/44'/0'/0'/0/1"

// A tool is available for generating derivation path easier.
// Please see various use cases below :
const keyId = UBIP44.keyId("4-67"); // => "m/44'/0'/4'/0/67"
const keyId = UBIP44.keyId("67"); // => "m/44'/0'/0'/0/67"
const keyId = UBIP44.keyId({account: 4, index: 67}); // => "m/44'/0'/4'/0/67"
const keyId = UBIP44.keyId({index: 67}); // => "m/44'/0'/0'/0/67"
```

### Signing Transactions and Messages

For HDWallets

```javascript
import { HDWallets, Signer } from "web3-kms-signer";

const chainId = 3; // Ropsten
const signer = new Signer(new HDWallets(hdProvider), chainId);
```

For KMSWallets

```javascript
import { KMSWallets, Signer } from "web3-kms-signer";

const chainId = 3; // Ropsten
const signer = new Signer(new KMSWallets(kmsProvider), chainId);
```

Signing Transactions

```javascript
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

Signing Messages

```javascript
const message = "hello world !";
const signedMessage = await signer.signMessage({ KeyId: 'keyId' }, message);
```

## Complete implementation

#### KMS Wallets

##### Using AWS KMS:

```javascript
import { KMSProvider, KMSWallets, Signer } from "web3-kms-signer";
import  web3  from  "web3";

// setup provider
const awsConfig = {
    region: 'us-east-1',
    credentials: {
        accessKeyId: 'YOUR_AWS_ACCESS_KEY_ID',
        secretAccessKey: 'YOUR_AWS_SECRET_ACCESS_KEY'
    }
};
const kmsProvider = new KMSProvider.AWS(awsConfig);

const chainId = 3; // Ropsten
const signer = new Signer(new KMSWallets(kmsProvider), chainId);

const txData = {
    nonce: '0x00', // Replace with actual nonce
    gasPrice: '0x09184e72a000', // Replace with actual gas price
    gasLimit: '0x2710', // Replace with actual gas limit
    to: '0x0000000000000000000000000000000000000000', // Replace with recipient address
    value: '0x00', // Amount to send
    data: '0x0', // Data payload if any
};

const signedTx = await signer.signTransaction({ KeyId: 'aws keyId' /*defined before*/ }, txData);

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
import { KMSProvider, KMSWallets, Signer } from "web3-kms-signer";
import  web3  from  "web3";

const gcpConfig = {
    keyFilename: 'path/to/your/gcp/keyfile.json'
};
const kmsProvider = new KMSProvider.GCP(gcpConfig);
kmsProvider.setPath({
        projectId: 'your-gcp-project-id',
        locationId: 'your-gcp-location-id',
        keyRingId: 'key-ring-id' // defined before
    });

const chainId = 3; // Ropsten
const signer = new Signer(new KMSWallets(kmsProvider), chainId);

const txData = {
    nonce: '0x00', // Replace with actual nonce
    gasPrice: '0x09184e72a000', // Replace with actual gas price
    gasLimit: '0x2710', // Replace with actual gas limit
    to: '0x0000000000000000000000000000000000000000', // Replace with recipient address
    value: '0x00', // Amount to send
    data: '0x0', // Data payload if any
};

const signedTx = await signer.signTransaction({ KeyId: 'gcp keyId' /*defined before*/ }, txData);

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
import { HDProvider, HDWallets, Signer } from "web3-kms-signer";
import  web3  from  "web3";

const mnemonic = "your mnemonic phrase here";
const hdProvider = new HDProvider.NodeWallet(mnemonic);

const chainId = 3; // Ropsten
const signer = new Signer(new HDWallets(hdProvider), chainId);

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