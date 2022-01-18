async function getBagDifficulty(account) {
    if(localStorage.getItem('bag_difficulty')!==null){
        return localStorage.getItem('bag_difficulty');
    }
    try {
        const bag = await getBag(mining_account, account, wax.api.rpc, aa_api);
        const params = getBagMiningParams(bag);
        localStorage.setItem("bag_difficulty", params.difficulty);
        return params.difficulty;
    } catch (error) {
        return error;
    }
};
  
async function getLandDifficulty(account) {
    if(localStorage.getItem('land_difficulty')!==null){
        return localStorage.getItem('land_difficulty');
    }
    try {
        const land = await getLand(
            mining_account,
            account,
            wax.api.rpc,
            api_endpoints
        );
        const params = getLandMiningParams(land);
        localStorage.setItem("land_difficulty", params.difficulty);
        return params.difficulty;
    } catch (error) {
        return error;
    }
};

async function background_mine(account){
    return new Promise(async (resolve, reject) => {
        const bagDifficulty = await getBagDifficulty(account);
        const landDifficulty = await getLandDifficulty(account);
        const difficulty = bagDifficulty + landDifficulty;    

        const last_mine_tx = await lastMineTx(mining_account, account, wax.api.rpc);

        doWorkWorker({ mining_account, account, difficulty, last_mine_tx }).then(
            (mine_work) => {
                resolve(mine_work);
            }
        );
    });
};

async function mine(logging){
    const mine_work = await background_mine(wax.userAccount);
    nonce = mine_work.rand_str

    let actions = [
        {
          account: "m.federation",
          name: "mine",
          authorization: [{
              actor: wax.userAccount,
              permission: "active",
            }],
            data: {
                miner: wax.userAccount,
                nonce: nonce,
            },
        }
    ];
    var failCount = 0;
    while(failCount<10){
        try{
            const result = await wax.api.transact({actions},{blocksBehind: 3,expireSeconds: 90});
            if (result && result.processed) {
                let mined_amount = 0;
                result.processed.action_traces[0].inline_traces.forEach((t) => {
                    if (t.act.account === 'alien.worlds' && t.act.name === 'transfer' && t.act.data.to === wax.userAccount) {
                      const [amount_str] = t.act.data.quantity.split(' ');
                      mined_amount += parseFloat(amount_str);
                    }
                });
                logging.log(`mined ${mined_amount} TLM`)
                break;
            }
        }catch (err) {
            failCount+=1;
            logging.log(`fail[${failCount}]: ${err.message}`);
            if(err.message.indexOf('NOTHING_TO_MINE')!=-1){
                location.href = "http://www.baidu.com";
            }
            console.log(actions);
            await sleep(60000);
            await sleep(Math.floor(Math.random() * 60000));
        }
    }
    return failCount;
}
