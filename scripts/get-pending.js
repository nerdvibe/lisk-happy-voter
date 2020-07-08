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

~~~ check status of pending payouts ~~~

`);


(async () => {
    const data = getBalanceFile();
    const totalToBePaid = Object.keys(data.accounts).reduce((acc, key) => acc + (+data.accounts[key].pending), 0)

    console.log();
    console.log('\n\n',`👉 Last payout generated on ${new Date(data.lastpayout).toISOString()}, pending: ${totalToBePaid} LSK 👈`, '\n\n');
})();
