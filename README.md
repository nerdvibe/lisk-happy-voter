# <img src="https://github.com/nerdvibe/lisk-happy-voter/blob/master/meta/lsk.png?raw=true" height="40" width="40" align="left">lisk-happy-voter (for pools)  🥳
#### Simple Lisk payout script focused on multi delegate pools

This script is forked from [yet-another-lisk-pool](https://github.com/alepop/yet-another-lisk-pool) from Alepop delegate and adapted for pools payouts.

## Installation

    git clone https://github.com/nerdvibe/lisk-happy-voter.git
    cd ./lisk-happy-voter
    yarn

## Configuration
Rename `example.config.json` to `config.json` and fill it with your settings.

```json
{
    "node": "https://testnet.lisk.io",
    "port": "443",
    "isTestnet": true,
    "epochPoolTime": 1593738603,
    "sharedPercent": 20,
    "sharingDelegates": 3,
    "minPayout": 1,
    "referenceDelegatePubKey":
    "the delegate where the blocks will be counted",
    "poolMembers": [
        "pubKey for each delegate in the pool, used to get the voters",
        "pubKey for each delegate in the pool, used to get the voters",
    ],
    "poolAddresses": [
        "address for each delegate in the pool, blacklisted from reward",
        "address for each delegate in the pool, blacklisted from reward",
        "address for each delegate in the pool, blacklisted from reward"
    ]
}
```

where:
 - `epochPoolTime` is the first time the pool has been created in unix timestamp
 - `sharingDelegates` is the number of delegates sharing the rewards in the group.
  
## Usage

Use this commands:


```js
yarn get:payouts // will calculate rewards and save it to the ./data/balance.json file

yarn sign:transactions -- "secret" "secondSecret" // will sign transaction and save it to the ./data/payouts.json file

yarn broadcast:transactions // Broadcast transactions to the network


// in case you want to know how much is the payout after you generated

yarn help:get-pending
```

## Todos

- Remove vote-all rule
- Update deps & Node
- Switch to bigJS and fix rounding issues
- Fix prettier
- Go Typescript

Brought to you by 🍝Carbonara (lisk.chat @ carbonara) together with the efforts yet [yet-another-lisk-pool](https://github.com/alepop/yet-another-lisk-pool).

## Disclaimer

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
