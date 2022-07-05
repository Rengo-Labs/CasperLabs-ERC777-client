import {CLValueBuilder, RuntimeArgs} from "casper-js-sdk";
import {getAccounts} from "../../helpers/utils";
import ERC777 from "../../clients/erc777/ERC777";

const run = async () => {
    const {ownerHash, operatorHash, recipientHash} = getAccounts();

    const erc777 = new ERC777();
    await erc777.initContract();

    const tokenTotalSupply = await erc777.totalSupply();
    console.log(`total_supply: ${tokenTotalSupply}`)

    const tokenName = await erc777.name();
    console.log(`name: ${tokenName}`)

    const tokenDecimals = await erc777.decimals();
    console.log(`decimals: ${tokenDecimals}`)

    const ownerBalance = await erc777.balanceOf(CLValueBuilder.key(ownerHash));
    console.log(`owner balance: ${ownerBalance}`)

    const tokenGranularity = await erc777.granularity();
    console.log(`granularity: ${tokenGranularity}`)

    await erc777.send(RuntimeArgs.fromMap({
        recipient: CLValueBuilder.key(recipientHash),
        amount: CLValueBuilder.u256("100"),
        data: CLValueBuilder.list([])
    }));

    await erc777.burn(RuntimeArgs.fromMap({
        amount: CLValueBuilder.u256("50"),
        data: CLValueBuilder.list([])
    }));

    await erc777.authorizeOperator(RuntimeArgs.fromMap({
        operator: CLValueBuilder.key(operatorHash)
    }));

    const operators = await erc777.getDefaultOperators(CLValueBuilder.key(ownerHash));
    console.log(`operators: ${operators}`)

    await erc777.operatorSend(RuntimeArgs.fromMap({
        sender: CLValueBuilder.key(ownerHash),
        recipient: CLValueBuilder.key(recipientHash),
        amount: CLValueBuilder.u256("40"),
        data: CLValueBuilder.list([]),
        operator_data: CLValueBuilder.list([])
    }));

    await erc777.operatorBurn(RuntimeArgs.fromMap({
        account: CLValueBuilder.key(ownerHash),
        amount: CLValueBuilder.u256("10"),
        data: CLValueBuilder.list([]),
        operator_data: CLValueBuilder.list([])
    }));

    await erc777.revokeOperator(RuntimeArgs.fromMap({
        operator: CLValueBuilder.key(operatorHash)
    }))

}

run()