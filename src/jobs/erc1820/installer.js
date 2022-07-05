import ERC1820 from '../../clients/erc1820/ERC1820';
import {RuntimeArgs} from "casper-js-sdk";

const installer = async () => {
    const erc1820 = new ERC1820()
    await erc1820.install(RuntimeArgs.fromMap({}))
}

installer()