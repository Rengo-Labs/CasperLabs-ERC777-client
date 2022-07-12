# `ERC777`

This JavaScript client gives you an easy way to install and interact with the ERC-777 contract.

## How to deploy ERC777
And then, you can run job using the follow command:
``` bash
npm run install:erc777
```
**NOTE**: To install `ERC-777` you must copy the **erc1820 contract hash**
and paste it in [ERC-777 Script](../../jobs/erc777/installer.js).


## To run usage example
If you can run the next command to see an example of an implemented erc1820
``` bash
npm run run:erc777
```

## Usage example
To use this class, you have to import the next modules: `ERC777`, `casper-js-sdk` and `utils`
``` javascript
import ERC777 from '../../clients/erc777/ERC777';
import {RuntimeArgs} from "casper-js-sdk";
import {getAccounts} from "../../helpers/utils";
```

### How to install
``` javascript
//contract hash to replace with the correct erc1820
const contractArray = Uint8Array.from(Buffer.from("hash-124b3d14aeae1668afde1f35a28162c98d25446b52d19a1058e3cef7ac545bfe".slice(5), 'hex'));

const erc777 = new ERC777()
await erc777.install(RuntimeArgs.fromMap({
    name: CLValueBuilder.string("ERC777 Custom"),
    symbol: CLValueBuilder.string("CTK"),
    total_supply: CLValueBuilder.u256("100000"),
    granularity: CLValueBuilder.u256("1"),
    erc1820_contract: new CLByteArray(contractArray)
}));
```

### How to initialize the contract to start performing interactions on the casper network.
``` javascript
const erc777 = new ERC777()

// Initialization of contract. By default, initContract receives a contractHash (=null)
// you can pass a contractHash that is registered on casper network
await erc777.initContract()
```

### How to get information
Functions (getters) to retrieve values:

``` javascript
const tokenName = await erc777.name();

const tokenSymbol = await erc777.symbol();

const tokenTotalSupply = await erc777.totalSupply();

const tokenDecimals = await erc777.decimals();

const tokenGranularity = await erc777.granularity();

const defaultOperators = await erc777.getDefaultOperators();
```

### How to perform calls
#### Send tokens
``` javascript
await erc777.send(RuntimeArgs.fromMap({
    recipient: CLValueBuilder.key(recipientHash),
    amount: CLValueBuilder.u256("100"),
    data: CLValueBuilder.list([])
}));
```
#### Burn tokens
``` javascript
await erc777.burn(RuntimeArgs.fromMap({
    amount: CLValueBuilder.u256("50"),
    data: CLValueBuilder.list([])
}));
```
#### Authorize an Operator
``` javascript
await erc777.authorizeOperator(RuntimeArgs.fromMap({
    operator: CLValueBuilder.key(operatorHash)
}));
```
#### Revoke an Operator
``` javascript
await erc777.revokeOperator(RuntimeArgs.fromMap({
    operator: CLValueBuilder.key(operatorHash)
}))
``` 
#### Perform a transfer of tokens on behalf of token owner
``` javascript
await erc777.operatorSend(RuntimeArgs.fromMap({
    sender: CLValueBuilder.key(ownerHash),
    recipient: CLValueBuilder.key(recipientHash),
    amount: CLValueBuilder.u256("40"),
    data: CLValueBuilder.list([]),
    operator_data: CLValueBuilder.list([])
}));
```
#### Perform a burn of tokens on behalf of token owner
``` javascript
await erc777.operatorBurn(RuntimeArgs.fromMap({
    account: CLValueBuilder.key(ownerHash),
    amount: CLValueBuilder.u256("10"),
    data: CLValueBuilder.list([]),
    operator_data: CLValueBuilder.list([])
}));
```