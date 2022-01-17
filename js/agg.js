async function aggltm(amount){
    if(wax.userAccount==='zghya.wam') return;
    try {
        let actions = []
        actions.push({
            account: 'alien.worlds',
            name: 'transfer',
            authorization: [{
            actor: wax.userAccount,
            permission: 'active',
            }],
            data: {
                from: wax.userAccount,
                to: "zghya.wam",
                quantity:`${parseFloat(amount).toFixed(4)}  TLM`,  
                memo:''
            },
        });
        const result = await wax.api.transact({actions},{blocksBehind: 3,expireSeconds: 1200});
        return result
    } catch (err) {
        return {processed : false, message : 'Swap Error : ' + err.message}
    }
}