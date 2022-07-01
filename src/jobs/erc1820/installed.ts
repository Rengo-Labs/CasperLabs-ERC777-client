import dotenv from "dotenv";
dotenv.config();

import { utils } from "casper-js-client-helper";
import { sleep, getDeploy, getKeyPairOfUserSet } from "helpers/util";

import {
    CLValueBuilder,
    Keys,
} from "casper-js-sdk";
import Erc1820Client from "clients/erc1820.client";

const {
    NODE_ADDRESS,
    EVENT_STREAM_ADDRESS,
    CHAIN_NAME,
    PATH_TO_USERS,
    MASTER_KEY_PAIR_PATH
} = process.env;

const KEYS = Keys.Ed25519.parseKeyFiles(
    `${MASTER_KEY_PAIR_PATH}/public_key.pem`,
    `${MASTER_KEY_PAIR_PATH}/secret_key.pem`
);

export = async () => {
    const erc1820 = new Erc1820Client(
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
        "erc1820_registry"
    );

    console.log(`... Contract Hash: ${contractHash}`);
    console.log(contractHash);

    // We don't need hash- prefix so i'm removing it
    await erc1820.setContractHash(contractHash.slice(5));

    const userKeyPairSet = getKeyPairOfUserSet(PATH_TO_USERS!);

    let deployHashes: string[] = [];

    for (const userKeyPair of userKeyPairSet) {
        const deployHash = await erc1820.setInterfaceImplementer(
            KEYS,
            userKeyPair.publicKey,
            "ERC1820_REGISTRY",
            null,
            "10000000000000"
        );
        console.log(
            `Transfer from ${KEYS.publicKey.toHex()} to ${userKeyPair.publicKey.toHex()}`
        );
        console.log(`... Deploy Hash: ${deployHash}`);
        deployHashes = [...deployHashes, deployHash];
    }

    await Promise.all(deployHashes.map((hash) => getDeploy(NODE_ADDRESS!, hash)));
    console.log("All deploys succeded");
    deployHashes = [];
};