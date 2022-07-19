import {CLPublicKeyTag, CLValueBuilder, RuntimeArgs} from "casper-js-sdk";
import {getPublicAccounts} from "../../helpers/utils";
import ERC1337 from "../../clients/erc1337/ERC1337";

const run = async () => {

    const {ownerHash, recipientHash} = getPublicAccounts();

    const erc1337 = new ERC1337()
    await erc1337.initContract("7549cf77d241885090ee32e3bfde1bdc2ecee774cc0d37cce275ccac23490ce4")

    await erc1337.executeSubscription(RuntimeArgs.fromMap({
        signature: CLValueBuilder.string("tag"),
        from: CLValueBuilder.byteArray(recipientHash)
    }))
}

run()