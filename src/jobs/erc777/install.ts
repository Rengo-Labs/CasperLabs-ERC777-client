import dotenv from "dotenv";
dotenv.config();

import { utils } from "casper-js-client-helper";
import { sleep, getDeploy } from "helpers/util";

import {
    Keys,
} from "casper-js-sdk";
import ERC777Client from "clients/erc777.client";
import erc1820 from 'jobs/erc1820/install';

const {
    NODE_ADDRESS,
    EVENT_STREAM_ADDRESS,
    CHAIN_NAME,
    ERC777_WASM_PATH,
    MASTER_KEY_PAIR_PATH,
    TOKEN_NAME,
    TOKEN_SYMBOL,
    TOKEN_DECIMALS,
    TOKEN_SUPPLY,
    INSTALL_PAYMENT_AMOUNT,
} = process.env;

const KEYS = Keys.Ed25519.parseKeyFiles(
    `${MASTER_KEY_PAIR_PATH}/public_key.pem`,
    `${MASTER_KEY_PAIR_PATH}/secret_key.pem`
);

export = async () => {
    console.log("ERC777 installation")
    const erc777 = new ERC777Client(
        NODE_ADDRESS!,
        CHAIN_NAME!,
        EVENT_STREAM_ADDRESS!
    );

    console.log(`... Contract Info`);
    let accountInfo = await utils.getAccountInfo(NODE_ADDRESS!, KEYS.publicKey);
    console.log(`... Account Info: `);
    console.log(JSON.stringify(accountInfo, null, 2));

    console.log("Retrieving ERC1820 Hash")
    const erc1820ContractHash = await utils.getAccountNamedKeyValue(
        accountInfo,
        `erc1820_registry`
    );

    console.log("Installing ERC777")
    const installDeployHash = await erc777.install(
        KEYS,
        TOKEN_NAME!,
        TOKEN_SYMBOL!,
        TOKEN_DECIMALS!,
        TOKEN_SUPPLY!,
        erc1820ContractHash,
        INSTALL_PAYMENT_AMOUNT!,
        ERC777_WASM_PATH!
    );

    console.log(`... Contract installation deployHash: ${installDeployHash}`);

    await getDeploy(NODE_ADDRESS!, installDeployHash);

    const contractHash = await utils.getAccountNamedKeyValue(
        accountInfo,
        `erc777_token_contract`
    );

    console.log(`... Contract Hash: ${contractHash}`);

};