const { getRewards, getAccountsAndTotalVoteWeight } = require('./utils/api.js');
const config = require('../config.json');
const { calculateRewards } = require('./utils/lisk.js');
const { getBalanceFile, saveRewards } = require('./utils/file.js');

const getDate = () => {
    const now = new Date();
    const startsOfTheDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
    );
    return startsOfTheDay.getTime()
};



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

~~~ Get payout ~~~

`);


(async () => {

    const startTime = new Date();

    const data = getBalanceFile();
    const today = getDate(); // Calculate rewards only from start of the day not from execution time
    const { reward, sharingReward } = await getRewards(data.lastpayout, today);

    const adjustedSharingReward = sharingReward * config.sharingDelegates; // multiplying for # of sharing delegates

    console.log(
        `Forged by pool: ${reward * config.sharingDelegates} LSK from ${new Date(
            data.lastpayout,
        ).toLocaleString()}`,
    );

    console.log(
        `Sharing ${config.sharedPercent}% with voters: ${adjustedSharingReward} LSK`, `\n`
    );

    const { accounts, totalWeight } = await getAccountsAndTotalVoteWeight();

    console.log(`Total weight is ${totalWeight} LSK`, '\n');
    console.log('Calculate voters rewards...');

    const rewards = calculateRewards(accounts, adjustedSharingReward, totalWeight);
    console.log('Saving data...');
    saveRewards(data, rewards, today);
    console.log('Data saved to file.');

    console.log('\n\n',`👉💰 Make sure there are at least ${adjustedSharingReward} LSK on the payout address!💰👈`, '\n\n');

    const finishTime = new Date();

    console.log(`\nScript executed in ${(finishTime-startTime)/1000}\n`)
})();
