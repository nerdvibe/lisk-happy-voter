const config  = require("../../config.json");

const filterBlacklistedAddresses = accounts =>
  accounts.filter(account =>
    !config.poolAddresses.indexOf(account.address) >= 0);

module.exports = {
  filterBlacklistedAddresses,
};
