const {saveTempVotersFromApi, getInactiveVotersFile} = require("./file");
// const fs = require('jsonfile');
// const path = require('path');

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
        limit: 99,
        offset: currentOffset
      });
      voters[i].push(...data.voters);

      if(currentOffset === 0) {
        console.log(`This delegate has ${data.votes} votes`);
      }
      console.log(`[${i+1}/${config.poolMembers.length}]calculating ${currentOffset+99} votes of ${data.votes}`);

      if (data.votes <= currentOffset) {
        keepGoing = false;
      } else {
        currentOffset += 99;
      }
    }
  }

  let votes = { }
  let votesList = []
  for (let i in voters) {
    voters[i].map((voter) => {
      if(votes[voter.address]){
        votes[voter.address].matchedVotes++
      }else{
        votes[voter.address]={
          ...voter,
          "matchedVotes": 1
        }
      }
    })
  }

  // for quick testing, save votes in a file
  // saveTempVotersFromApi(votes)
  // for quick testing, load votes in a file
  // const votes = fs.readFileSync(path.resolve('data/votersFromApi.json'))

  const inactiveVoters = getInactiveVotersFile();

  Object.keys(votes).map((el) => {
    let weightMultiplier = 1;

    if(inactiveVoters.includes(votes[el].address)){
      weightMultiplier = 0.1
    } else if(1 <= votes[el].matchedVotes <= 5) {
      weightMultiplier = 1
    } else if (6 <= votes[el].matchedVotes <= 9) {
      weightMultiplier = 6
    } else if (votes[el].matchedVotes === 10) {
      weightMultiplier = 10
    }

    // 500k
    // const cappedVW = votes[el].balance > 50000000000000 ? 50000000000000 : votes[el].balance;
    // 1m
    const cappedVW = votes[el].balance > 100000000000000 ? 100000000000000 : votes[el].balance;
    // const cappedVW = votes[el].balance;

    votes[el].balance = cappedVW * weightMultiplier
    votesList.push(votes[el])
  })

  console.log(`Voters voting for the pool: ${votesList.length}`);



  return votesList;
};

const getAccountsAndTotalVoteWeight = async () => {
  console.log("Getting accounts data...");

  const voters = await getAllVoters();

  const filteredAccounts = filterBlacklistedAddresses(voters); // Exclude accounts based on config

  console.log("Calculating total vote weight...");

  const totalWeight = getTotalVoteWeight(filteredAccounts);
  return {
    accounts: filteredAccounts,
    totalWeight
  };
};

module.exports = {
  getAccountsAndTotalVoteWeight,
  getRewards,
  client
};
