import {CLValueBuilder, RuntimeArgs} from "casper-js-sdk";
import {getAccounts} from "../../helpers/utils";
import ERC777Recipient from "../../clients/erc777_recipient/ERC777Recipient";
import ERC777 from "../../clients/erc777/ERC777";

const run = async () => {

    const {ownerHash, operatorHash, recipientHash} = getAccounts();

    const erc777 = new ERC777()
    await erc777.initContract()

    await erc777.authorizeOperator(RuntimeArgs.fromMap({
        operator: CLValueBuilder.key(operatorHash)
    }))

    const erc777Recipient = new ERC777Recipient()
    await erc777Recipient.initContract()

    await erc777Recipient.transfer(RuntimeArgs.fromMap({
        from: CLValueBuilder.key(ownerHash),
        to: CLValueBuilder.key(recipientHash),
        amount: CLValueBuilder.u256(200),
        user_data: CLValueBuilder.list([]),
        operator_data: CLValueBuilder.list([])
    }))

    await erc777Recipient.burn(RuntimeArgs.fromMap({
        account: CLValueBuilder.key(ownerHash),
        amount: CLValueBuilder.u256(100),
        user_data: CLValueBuilder.list([]),
        operator_data: CLValueBuilder.list([])
    }))
}

run()