import {CLPublicKey, CLPublicKeyTag, CLValueBuilder, RuntimeArgs} from "casper-js-sdk";
import ERC1337 from "../../clients/erc1337/ERC1337";

const run = async () => {

    const erc1337 = new ERC1337()
    await erc1337.initContract("hash-728427bcbc55aba6aeb42ad316c88aba79fefbac24f87f107d5d601b3a89bed3")

    const ownerKey = "010e31a03ea026a8e375653573e0120c8cb96699e6c9721ae1ea98f896e6576ac3";
    const ownerHash = CLPublicKey.fromHex(ownerKey).toAccountHash();

    await erc1337.createSubscriptionHash(RuntimeArgs.fromMap({
        from: CLValueBuilder.byteArray(ownerHash),
        public: CLPublicKey.fromHex("013b8bd1f2bfc7241d69e7cba488bfca52e29d2836e1a8e62035719aee0b81f5f1")
    }))
}

run()