# BotCoin
IRC bot that allows to mine worthless virtual gold, designed specifically for the #CBNA

The project is still WIP, you can submit ideas for new features here : https://github.com/nolialsea/botcoin/issues/1

## Channel comamnds
### bc mine
Gives between 0 and 1 gold per day (without pickaxe). The amount of gold is based on the amount of time you didn't mine, so it's useless to spam it.
### bc help
Shows the commands
## Private commands (/msg BotCoin COMMAND)
### register LOGIN PASSWORD
You only need to register once, it connects you too
### connect LOGIN PASSWORD
You will need to reconnect basically each time you quit the channel, but you stay connected even when you change your nick
### create pickaxe INVESTMENT NAME  
INVESTMENT is the amount of gold you want to spend to forge this pickaxe, it should be a positive floating number  
The pickaxe power and durability will be random()*INVESTMENT  
NAME can be 32 characters long and contain pretty much any character, even spaces  
You can only have one pickaxe, and creating a new one delete the previous
