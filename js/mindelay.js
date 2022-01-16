async function getMineDelay(account) {
    try {
      const bag = await getBag(mining_account, account, wax.api.rpc, api_endpoints);
      const land = await getLand(
        mining_account,
        account,
        wax.api.rpc,
        api_endpoints
      );
      const params = getBagMiningParams(bag);
      const land_params = getLandMiningParams(land);
      params.delay *= land_params.delay / 10;
      params.difficulty += land_params.difficulty;
      var minedelay = await getNextMineDelay(
        mining_account,
        account,
        params,
        wax.api.rpc
      );
      return minedelay;
    } catch (error) {
      return error;
    }
  };