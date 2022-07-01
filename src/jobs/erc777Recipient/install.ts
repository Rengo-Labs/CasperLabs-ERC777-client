import dotenv from "dotenv";
dotenv.config();

import { utils } from "casper-js-client-helper";
import { sleep, getDeploy } from "helpers/util";

import {
    CLValueBuilder,
    Keys,
    CLPublicKey,
    CLPublicKeyType,
} from "casper-js-sdk";
import Erc777RecipientClient from "clients/erc777Recipient.client";
import erc1820 from 'jobs/erc1820/install';
import erc777 from 'jobs/erc777/install';

const {
    NODE_ADDRESS,
    EVENT_STREAM_ADDRESS,
    CHAIN_NAME,
    ERC777_RECIPIENT_WASM_PATH,
    MASTER_KEY_PAIR_PATH,
    INSTALL_PAYMENT_AMOUNT,
} = process.env;

const KEYS = Keys.Ed25519.parseKeyFiles(
    `${MASTER_KEY_PAIR_PATH}/public_key.pem`,
    `${MASTER_KEY_PAIR_PATH}/secret_key.pem`
);

export = async () => {
    console.log("ERC777Recipient installation")
    const erc777Recipient = new Erc777RecipientClient(
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

    console.log("Retrieving ERC777 Hash")
    const erc777ContractHash = await utils.getAccountNamedKeyValue(
        accountInfo,
        `erc1820_registry`
    );

    console.log("Installing ERC777 Recipient")
    const installDeployHash = await erc777Recipient.install(
        KEYS,
        erc1820ContractHash,
        erc777ContractHash,
        INSTALL_PAYMENT_AMOUNT!,
        ERC777_RECIPIENT_WASM_PATH!
    );

    console.log(`... Contract installation deployHash: ${installDeployHash}`);

    await getDeploy(NODE_ADDRESS!, installDeployHash);

    const contractHash = await utils.getAccountNamedKeyValue(
        accountInfo,
        `erc777_recipient_contract`
    );

    console.log(`... Contract Hash: ${contractHash}`);
};
