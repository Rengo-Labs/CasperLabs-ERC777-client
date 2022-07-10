# `ERC777-JS-CLIENT`

This JavaScript client gives you an easy way to install and interact with the ERC-777 contract.

## Set up the project

First of all, you need to download all plugins:

``` bash
npm install
```

## How to deploy every Contract
And then, you can run **every** job using the follow commands:
``` bash
npm run install:erc1820

npm run install:erc777

npm run install:erc777_recipient

npm run install:erc777_sender
```

**NOTE**: To install `ERC-777`, `ERC-777-RECIPIENT` and `ERC-777-SENDER` you must copy the **contract hash** 
and paste it in [ERC-777](src/jobs/erc777/installer.js), [ERC-777-RECIPIENT](src/jobs/erc777_recipient/installer.js) 
and [ERC-777-SENDER](src/jobs/erc777_sender/installer.js) correspondingly.

## Guide to use this client
These guides contain steps to implement every contract client and usage examples
- [ERC1820](src/clients/erc1820/README.md)
- [ERC777](src/clients/erc777/README.md)
- [ERC777 Recipient](src/clients/erc777_recipient/README.md)
- [ERC777 Sender](src/clients/erc777_sender/README.md)

## More examples

You can find all the available examples in the [central project repository](https://github.com/Rengo-Labs/CasperLabs-ERC777-client/tree/master/src/jobs).
