import ERC777 from '../../clients/erc777/ERC777';
import {CLByteArray, CLValueBuilder, RuntimeArgs} from "casper-js-sdk";

const installer = async () => {

    //contract hash to replace with the correct erc1820
    const contractArray = Uint8Array.from(Buffer.from("hash-124b3d14aeae1668afde1f35a28162c98d25446b52d19a1058e3cef7ac545bfe".slice(5), 'hex'));

    const erc777 = new ERC777()
    await erc777.install(RuntimeArgs.fromMap({
        name: CLValueBuilder.string("ERC777 Custom"),
        symbol: CLValueBuilder.string("CTK"),
        total_supply: CLValueBuilder.u256("100000"),
        granularity: CLValueBuilder.u256("1"),
        erc1820_contract: new CLByteArray(contractArray)
    }));
}

installer()