import "module-alias/register";
import dotenv from "dotenv";

dotenv.config();

import erc1820 from 'jobs/erc1820/install';
import erc777 from 'jobs/erc777/install';
import erc777Sender from 'jobs/erc777Sender/install';
import erc777Recipient from 'jobs/erc777Recipient/install';

import erc1820Test from 'jobs/erc1820/installed';
import erc777Test from 'jobs/erc777/installed';
import erc777SenderTest from 'jobs/erc777Sender/installed';
import erc777RecipientTest from 'jobs/erc777Recipient/installed';


const runJobs = async () => {
    console.log("START - runJobs");
    console.log(process.argv);
    if(process.argv[2] === "erc1820")
        await erc1820();
    if(process.argv[2] === "erc777")
        await erc777();
    if(process.argv[2] === "erc777Recipient")
        await erc777Recipient();
    if(process.argv[2] === "erc777Sender")
        await erc777Sender();

    if (process.argv[2] === "-t") {
        if(process.argv[3] === "erc1820")
            await erc1820Test();
        if(process.argv[3] === "erc777")
            await erc777Test();
        if(process.argv[3] === "erc777Recipient")
            await erc777RecipientTest();
        if(process.argv[3] === "erc777Sender")
            await erc777SenderTest();
    }
    console.log("ENDED - runJobs");
}

runJobs();

process.exit(0);