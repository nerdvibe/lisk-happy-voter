const { APIClient } = require("lisk-elements").default;
const { fromRawLsk, getTotalVoteWeight } = require("./lisk.js");
const {
  filterBlacklistedAddresses
} = require("./accounts.js");
const config = require("../../config.json");

const node = config.node && `${config.node}:${config.port}`;

const client = config.isTestnet
  ? APIClient.createTestnetAPIClient({ node })
  : APIClient.createMainnetAPIClient({ node });

const getRewards = async (fromTimestamp, toTimestamp) => {
  console.log(`Get forging data for period ${new Date(fromTimestamp).toLocaleString()} to ${new Date(toTimestamp).toLocaleString()}`);

  // Get delegate address for next request
  const {
    data: [delegate]
  } = await client.delegates.get({ publicKey: config.referenceDelegatePubKey });
  const { address } = delegate.account;

  const { data } = await client.delegates.getForgingStatistics(address, {
    fromTimestamp,
    toTimestamp
  });
  const reward = fromRawLsk(data.forged);
  const sharingReward = (reward * config.sharedPercent) / 100;
  return {
    reward,
    sharingReward
  };
};

const getAllVoters = async () => {
  let voters = {};

  const pubKeys = config.poolMembers;

  for (const [i, pk] of pubKeys.entries()) {
    let keepGoing = true;
    let currentOffset = 0;

    voters[i] = [];
    console.log(`[${i+1}/${config.poolMembers.length}]Checking votes for ${pk}`);

    while (keepGoing) {
      const { data } = await client.voters.get({
        publicKey: pk,
        limit: 50,
        offset: currentOffset
      });
      voters[i].push(...data.voters);

      if(currentOffset === 0) {
        console.log(`This delegate has ${data.votes} votes`);
      }
      console.log(`[${i+1}/${config.poolMembers.length}]calculating ${currentOffset+50} votes of ${data.votes}`);

      if (data.votes <= currentOffset) {
        keepGoing = false;
      } else {
        currentOffset += 50;
      }
    }
  }

  // console.debug(voters, 'voters');

  const commonVoters = voters[0]

  // Find common voters
  for (var i in voters) {
    for (var k in commonVoters) {
      if (!JSON.stringify(voters[i]).includes(JSON.stringify(commonVoters[k]))) {
        commonVoters.splice(k, 1);
      }
    }
  }

  console.log(`Voters voting for the pool: ${commonVoters.length}`);


  return commonVoters;
};

const getAccountsAndTotalVoteWeight = async () => {
  console.log("Getting accounts data...");

  const voters = await getAllVoters();

  const filteredAccounts = filterBlacklistedAddresses(voters); // Exclude accounts based on config

  console.log("Calculating total vote weight...");

  const totalWeight = getTotalVoteWeight(filteredAccounts);
  return {
    accounts: voters,
    totalWeight
  };
};

module.exports = {
  getAccountsAndTotalVoteWeight,
  getRewards,
  client
};
