const assert = require('assert');

contract('Version', (accounts) => {
  // Test constants
  const OWNER = accounts[0];
  const ADDRESS_PLACEHOLDER = '0x0';

  // Test globals
  let versionContract;
  let coreContract;
  let etherTokenContract;
  let bitcoinTokenContract;
  let dollarTokenContract;
  let euroTokenContract;
  let priceFeedContract;
  let exchangeContract;
  let registrarContract;
  let riskmgmtContract;

  before('Check accounts, deploy modules, set testcase', (done) => {
    assert.equal(accounts.length, 10);
    EtherToken.new({ from: OWNER })
    .then((result) => {
      etherTokenContract = result;
      return BitcoinToken.new({ from: OWNER });
    })
    .then((result) => {
      bitcoinTokenContract = result;
      return RepToken.new({ from: OWNER });
    })
    .then((result) => {
      dollarTokenContract = result;
      return EuroToken.new({ from: OWNER });
    })
    .then((result) => {
      euroTokenContract = result;
      return PriceFeed.new({ from: OWNER });
    })
    .then((result) => {
      priceFeedContract = result;
      return Exchange.new({ from: OWNER });
    })
    .then((result) => {
      exchangeContract = result;
      return Universe.new(
        [
          etherTokenContract.address,
          bitcoinTokenContract.address,
          dollarTokenContract.address,
          euroTokenContract.address,
        ], [
          priceFeedContract.address,
          priceFeedContract.address,
          priceFeedContract.address,
          priceFeedContract.address,
        ], [
          exchangeContract.address,
          exchangeContract.address,
          exchangeContract.address,
          exchangeContract.address,
        ], { from: OWNER });
    })
    .then((result) => {
      registrarContract = result;
      return RiskMgmt.new(exchangeContract.address, { from: OWNER });
    })
    .then((result) => {
      riskmgmtContract = result;
      done();
    });
  });

  it('Create a Core contract through the Version contract', (done) => {
    Version.new(ADDRESS_PLACEHOLDER)
    .then((result) => {
      versionContract = result;
      return versionContract.createCore(
        registrarContract.address,
        riskmgmtContract.address,
        ADDRESS_PLACEHOLDER,
        ADDRESS_PLACEHOLDER,
        { from: OWNER });
    })
    .then(() => versionContract.numCreatedCores())
    .then((result) => {
      assert.strictEqual(result.toNumber(), 1);
      return versionContract.coreAt(0);
    })
    .then((result) => {
      coreContract = Core.at(result);
      return coreContract.owner();
    })
    .then(() => {
      /* TODO Set Owner of Portfolio equal to Portfolio creator */
      // assert.equal(OWNER, result, "Core.owner != OWNER!");
    })
    .then(done)
    .catch(done);
  });
});
