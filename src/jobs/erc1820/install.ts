import dotenv from "dotenv";
dotenv.config();

import { utils } from "casper-js-client-helper";
import { sleep, getDeploy } from "helpers/util";

import {
    Keys,
} from "casper-js-sdk";
import ERC1820Client from "clients/erc1820.client";

const {
    NODE_ADDRESS,
    EVENT_STREAM_ADDRESS,
    CHAIN_NAME,
    ERC1820_WASM_PATH,
    MASTER_KEY_PAIR_PATH,
    INSTALL_PAYMENT_AMOUNT,
} = process.env;

const KEYS = Keys.Ed25519.parseKeyFiles(
    `${MASTER_KEY_PAIR_PATH}/public_key.pem`,
    `${MASTER_KEY_PAIR_PATH}/secret_key.pem`
);

export = async () => {
    console.log("ERC1820Client installation")
    const erc1820 = new ERC1820Client(
        NODE_ADDRESS!,
        CHAIN_NAME!,
        EVENT_STREAM_ADDRESS!
    );

    console.log("installing erc1820")
    const installDeployHash = await erc1820.install(
        KEYS,
        INSTALL_PAYMENT_AMOUNT!,
        ERC1820_WASM_PATH!
    ).catch(e => {
        console.log(e)
        return null;
    });

    if (!installDeployHash) {
        console.log("... Finish without process")
        return 0;
    }
    console.log(`... Contract installation deployHash: ${installDeployHash}`);

    await getDeploy(NODE_ADDRESS!, installDeployHash);

    console.log(`... Contract installed successfully.`);

    let accountInfo = await utils.getAccountInfo(NODE_ADDRESS!, KEYS.publicKey);

    console.log(`... Account Info: `);
    console.log(JSON.stringify(accountInfo, null, 2));

    const contractHash = await utils.getAccountNamedKeyValue(
        accountInfo,
        `erc1820_registry`
    );

    console.log(`... Contract Hash: ${contractHash}`);

};
