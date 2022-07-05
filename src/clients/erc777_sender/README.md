# `ERC777-SENDER`

This JavaScript client gives you an easy way to install and interact with the Casper ERC-777 contract.

## Set up the project

First of all, you need to download all plugins:

```
npm install
```

## How to deploy ERC777 Sender
And then, you can run **every** job using the follow commands:
```
npm run install:erc777_sender
```

**NOTE**: To install `ERC-777-SENDER` you must copy the **erc1820 and erc777 contract hash** 
and paste it in [ERC-777-SENDER Script](src/jobs/erc777_sender/installer.js).

## Usage example
To use this class, you have to import the next modules: `ERC777Sender`, `casper-js-sdk`, `utils` and `ERC777`
```
import ERC777Sender from "../../clients/erc777_sender/ERC777Sender";
import {CLValueBuilder, RuntimeArgs} from "casper-js-sdk";
import {getAccounts} from "../../helpers/utils";
import ERC777 from "../../clients/erc777/ERC777";
```

To install the ERC777Sender, you must firstly install the [ERC1820](src/jobs/erc1820/installer.js)
and [ERC777](src/jobs/erc777/installer.js) to get the **erc1820 contract hash**; 
and then, you have to copy it and pass it as a [ERC777Sender](src/jobs/erc777/installer.js) parameter. 
```
//contract hash to replace with the correct erc1820 and erc777
const erc1820ContractArray = Uint8Array.from(Buffer.from("hash-124b3d14aeae1668afde1f35a28162c98d25446b52d19a1058e3cef7ac545bfe".slice(5), 'hex'));
const erc777ContractArray = Uint8Array.from(Buffer.from("hash-590a29371bb8d7d57a319fbc984c09f12558a56129bdfa90e8b585011002eb77".slice(5), 'hex'));

const erc777Sender = new ERC777Sender()
await erc777Sender.install(RuntimeArgs.fromMap({
    erc1820_contract: new CLByteArray(erc1820ContractArray),
    erc777_contract: new CLByteArray(erc777ContractArray)
}))
```

### How to perform calls
To perform these calls, you have to register an operator as an account operator.

#### Transfer tokens on behalf of token owner
```
const {ownerHash, operatorHash, recipientHash} = getAccounts();

await erc777Sender.transfer(RuntimeArgs.fromMap({
    from: CLValueBuilder.key(ownerHash),
    to: CLValueBuilder.key(recipientHash),
    amount: CLValueBuilder.u256(200),
    user_data: CLValueBuilder.list([]),
    operator_data: CLValueBuilder.list([])
}))
```
#### Burn tokens on behalf of token owner
```
const {ownerHash, operatorHash, recipientHash} = getAccounts();
await erc777Sender.burn(RuntimeArgs.fromMap({
    account: CLValueBuilder.key(operatorHash),
    amount: CLValueBuilder.u256(100),
    user_data: CLValueBuilder.list([]),
    operator_data: CLValueBuilder.list([])
}))
```