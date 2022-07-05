# `ERC1820`

This JavaScript client gives you an easy way to install and interact with the ERC-1820 contract.

## How to deploy ERC1820
And then, you can run job using the follow command:
```
npm run install:erc1820
```

## To run usage example
If you can run the next command to see an example of an implemented erc1820
```
npm run run:erc1820
```

## Usage example
To use this class, you have to import the next modules: `ERC1820`, `casper-js-sdk` and `utils`
```
import ERC1820 from '../../clients/erc1820/ERC1820';
import {RuntimeArgs} from "casper-js-sdk";
import {getAccounts} from "../../helpers/utils";
```

### How to install
```
const erc1820 = new ERC1820()
await erc1820.install(RuntimeArgs.fromMap({}))
```

### How to initialize the contract to start performing interactions on the casper network.
```
const erc1820 = new ERC1820()

// Initialization of contract. By default, initContract receives a contractHash (=null)
// you can pass a contractHash that is registered on casper network
await erc1820.initContract()
```

### How to perform calls
Transfer some tokens from the direct caller to a recipient.

#### Set Manager
```
//Account who will receive tokens after calling at the send entry point
const {ownerHash, operatorHash} = getAccounts();

await erc1820.setManager(RuntimeArgs.fromMap({
    account: CLValueBuilder.key(ownerHash),
    new_manager: CLValueBuilder.key(ownerHash)
}))
```
#### Set Interface Implementer
```
//Account who will receive tokens after calling at the send entry point
const {ownerHash, operatorHash} = getAccounts();
await erc1820.setInterfaceImplementer(RuntimeArgs.fromMap({
    account: CLValueBuilder.key(ownerHash),
    i_hash: CLValueBuilder.list(utils.stringToArrayCLU8("ERC777TokensSender")),
    implementer: CLValueBuilder.key(operatorHash),
}))
```
### How to get information
Set functions (getters) to retrieve values:
#### Get Manager
```
const manager = await erc1820.getManager(CLValueBuilder.key(ownerHash))
```
#### Get Interface Implementer
```
const implementer = await erc1820.getInterfaceImplementer(CLValueBuilder.key(ownerHash), "ERC777TokensSender")
```