import dotenv from "dotenv";
dotenv.config();

import { utils } from "casper-js-client-helper";
import { sleep, getDeploy, getKeyPairOfUserSet } from "helpers/util";

import {
    CLValueBuilder,
    Keys,
    CLPublicKey,
    CLPublicKeyType,
} from "casper-js-sdk";
import Erc777RecipientClient from "clients/erc777Recipient.client";

const {
    NODE_ADDRESS,
    EVENT_STREAM_ADDRESS,
    CHAIN_NAME,
    WASM_PATH,
    PATH_TO_USERS,
    MASTER_KEY_PAIR_PATH
} = process.env;

const KEYS = Keys.Ed25519.parseKeyFiles(
    `${MASTER_KEY_PAIR_PATH}/public_key.pem`,
    `${MASTER_KEY_PAIR_PATH}/secret_key.pem`
);

export = async () => {
    const erc777Recipient = new Erc777RecipientClient(
        NODE_ADDRESS!,
        CHAIN_NAME!,
        EVENT_STREAM_ADDRESS!
);

    console.log('Test init.');

    await sleep(5 * 1000);

    console.log('... getting Account info');

    let accountInfo = await utils.getAccountInfo(NODE_ADDRESS!, KEYS.publicKey);

    console.log(`... Account Info: `);
    console.log(JSON.stringify(accountInfo, null, 2));

    const contractHash = await utils.getAccountNamedKeyValue(
        accountInfo,
        "erc777_recipient_contract"
    );

    console.log(`... Contract Hash: ${contractHash}`);
    console.log(contractHash);

    // We don't need hash- prefix so i'm removing it
    await erc777Recipient.setContractHash(contractHash.slice(5));

    const userKeyPairSet = getKeyPairOfUserSet(PATH_TO_USERS!);

    let deployHashes: string[] = [];

    await Promise.all(deployHashes.map((hash) => getDeploy(NODE_ADDRESS!, hash)));
    console.log("All deploys succeded");

    deployHashes = [];
};
