const {saveTempVotersFromApi, getInactiveVotersFile} = require("./utils/file");
const fs = require('jsonfile');
const path = require('path');

const { APIClient } = require("lisk-elements").default;
const config = require("../config.json");

const node = config.node && `${config.node}:${config.port}`;

const client = config.isTestnet
  ? APIClient.createTestnetAPIClient({ node })
  : APIClient.createMainnetAPIClient({ node });

console.log(`


$$\\       $$\\           $$\\             $$$$$$$\\                                           $$\\     
$$ |      \\__|          $$ |            $$  __$$\\                                          $$ |    
$$ |      $$\\  $$$$$$$\\ $$ |  $$\\       $$ |  $$ |$$$$$$\\  $$\\   $$\\  $$$$$$\\  $$\\   $$\\ $$$$$$\\   
$$ |      $$ |$$  _____|$$ | $$  |      $$$$$$$  |\\____$$\\ $$ |  $$ |$$  __$$\\ $$ |  $$ |\\_$$  _|  
$$ |      $$ |\\$$$$$$\\  $$$$$$  /       $$  ____/ $$$$$$$ |$$ |  $$ |$$ /  $$ |$$ |  $$ |  $$ |    
$$ |      $$ | \\____$$\\ $$  _$$<        $$ |     $$  __$$ |$$ |  $$ |$$ |  $$ |$$ |  $$ |  $$ |$$\\ 
$$$$$$$$\\ $$ |$$$$$$$  |$$ | \\$$\\       $$ |     \\$$$$$$$ |\\$$$$$$$ |\\$$$$$$  |\\$$$$$$  |  \\$$$$  |
\\________|\\__|\\_______/ \\__|  \\__|      \\__|      \\_______| \\____$$ | \\______/  \\______/    \\____/ 
                                                           $$\\   $$ |                              
                                                           \\$$$$$$  |                              
                                                            \\______/                               

~~~ Get Inactives ~~~

`);

const getInactives = async () => {
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

  Object.keys(votes).map((el) => {
    votesList.push(votes[el])
  })

  const liskEpoch = new Date(Date.UTC(2016, 4, 24, 17, 0, 0, 0));
  const liskEpochMs = liskEpoch.getTime();
  const toLiskEpoch = (timestamp) => {
    return Math.floor((timestamp - liskEpochMs) / 1000);
  };
  const twoYearsAgo = toLiskEpoch(new Date().setYear(new Date().getFullYear() - 2))

  const allVoters = JSON.stringify(votesList.map(a => a.address));
  const allVotersDBReady = JSON.stringify(votesList.map(a => a.address)).replace('[', '(').replace(']', ')').replace(/"/g, "'");

  console.log('\n\n\n')
  console.log('\n\n\n')
  console.log('\n\n\n')
  console.log(`DB_QUERY:`)
  console.log(`SELECT json_agg(active) FROM ( select DISTINCT "senderId" from trs where timestamp > ${twoYearsAgo} and "senderId" in ${allVotersDBReady}) AS active;`)
  console.log('\n\n\n')
  console.log(`ALL_VOTERS:`)
  console.log(allVoters)
  console.log('\n\n\n')
  console.log('\n\n\n')
  console.log('1) copy and paste DB_QUERY in your DB')
  console.log(`2) copy the query result and execute this command:`)
  console.log(`3) open  the chrome console and copy the previous array into a variable. "const active = PASTE_YOUR_RESULT.map(a => a.senderId)"`)
  console.log('4) copy ALL_VOTERS into a variable called all.  "const all = ALL_VOTERS"')
  console.log('5) execute this command "console.log(JSON.stringify(all.filter(d => !active.includes(d)), null, 1))"')
  console.log('6) copy the result into inactiveVoters.json file')
  console.log('7) generate the payout as usual')
  console.log('\n')
  console.log('note: uppercased words, means that you have to do something.')

};

(async () => {await getInactives()})();

//// get all voters
// const all = getAllVoters() (-> ['address1L', 'address2L'])

//// Calculate the date of two years ago...
// liskEpoch = new Date(Date.UTC(2016, 4, 24, 17, 0, 0, 0));
// liskEpochMs = liskEpoch.getTime();
// const toLiskEpoch = (timestamp) => {
//   return Math.floor((timestamp - liskEpochMs) / 1000);
// };
// const twoYearsAgo = toLiskEpoch(new Date().setYear(2018))

////
// query to db in order to get active voters: select DISTINCT "senderId" from trs where timestamp > 'twoYearsAgo' and "senderId" in ('address1L', 'address2L')

//// queryResult to array of strings:
// const active = queryResultToArray() (-> ['address1L', 'address2L'])

//// This are the inactive
// console.log(JSON.stringify(all.filter(d => !active.includes(d)), null, 1))
