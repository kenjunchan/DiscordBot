/**
 * 
 */



const Discord = require('discord.js')
const client = new Discord.Client();
client.login("") //Discord Token Here
const riotAPIKey = "";
const ytdl = require("ytdl-core");
const axios = require('axios');
const Datastore = require('nedb');
var schedule = require('node-schedule');
const table = require('table');

//var lastSentMsg;
var servers = {};
var bannedWords = ["<:pepering:760989004244975641>", "💍"];
//List of Commands Avalible
const helpCommands = ["help"];
const opggCommands = ["opgg", "op.gg"];
const allOpggCommands = ["aopgg", "a.op.gg"];
const championCommands = ["champ", "ch"];
const memeifyCommands = ["meme", "me"];
const caesarRodneyCommands = ["cr", "caesar", "cesar"];
const pencaderCommands = ["pencader", "pen"];
const pogPlantImageCommands = ["pogplant", "pp"];
const magic8BallCommands = ["8ball", "magic", "8", "magic8ball", "m8"];
const dogCommands = ["dog"];
//const catCommands = ["cat"];
const registerCommands = ["register"];
const pCommands = ["pogcoins", "p"];
const coinflipCommands = ["coin"]
const rollCommands = ["roll"]
const musicCommands = ["music", "m"]
const playCommands = ["play"]
const emptyCommands = [""];


const allCommands = [helpCommands, opggCommands, allOpggCommands, championCommands, memeifyCommands, caesarRodneyCommands, pencaderCommands,
	pogPlantImageCommands, magic8BallCommands, dogCommands, registerCommands, pCommands, coinflipCommands, rollCommands, musicCommands, playCommands, emptyCommands];


//Load Database
const database = new Datastore('pogplantdatastore.db');
database.loadDatabase();

const dbCompactInterval = 60000; //number in miliseconds
//*****************************************************************************************************************************
client.on('ready', () => {
	client.user.setActivity("pogcoin tycoon")
	listAllConnectedServersAndChannels()
	console.log("DiscordBot Started")
	console.log("Setting Automatic Database Compaction to " + dbCompactInterval + " ms")
	database.persistence.setAutocompactionInterval(dbCompactInterval)
	globalCronjobs()
})

client.on('message', (receivedMessage) => {
	if (receivedMessage.author == client.user) {
		return
	}
	else if (receivedMessage.content.startsWith("!")) { //!command
		processCommand(receivedMessage)
	}
	else if (receivedMessage.author.id == "") { //dan's id
		//110190218694402048 dan's id
		if (checkBannedWordsArray(receivedMessage.content, bannedWords)) {
			receivedMessage.delete();
		}
	}
	else if (receivedMessage.author.id == "") {
		console.log("received message from 125805688797659138");
		if (checkBannedWordsArray(receivedMessage.content, bannedWords)) {
			receivedMessage.delete();
		}
		else if (receivedMessage.content.includes("💍")) {
			console.log("received ring");
		}
	}
	if (receivedMessage.content.includes(client.user.toString())) { //if bot is tagged in message

	}
})

function globalCronjobs() {
	var remindBobby = schedule.scheduleJob('0 0 20 * * *', function () {
		console.log('Reminding Bobby to remind Mike to take meds');
		client.channels.cache.get("695729119324799068").send("<@117775966213898242> remind mike to take meds!")
	});
	/*
	var remindKen = schedule.scheduleJob('0 0 19 * * *', function () {
		console.log('Reminding Bobby to remind Mike to take meds');
		client.channels.cache.get("758387764751499294").send("<@125805688797659138> remind mike to take meds!")
	});
	*/
	var cjPogCoins = schedule.scheduleJob('0,30 * * * *', function () {
		let pogcoinStimulus = 100;
		try {
			database.update({}, { $inc: { pogcoins: pogcoinStimulus } }, { multi: true }, function (err, numReplaced) { console.log("Giving everyone " + pogcoinStimulus + " pogcoins") });
		}
		catch (err) {
			console.log("something went wrong with trying to give everyone pogcoins")
		}
	});
	var newDay = schedule.scheduleJob('0 0 * * *', function () {
		try {
			database.update({}, { $set: { gambledRecently: false } }, { multi: true }, function (err, data) { console.log("setting gambledRecently for everyone to false") })
		}
		catch (err) {
			console.log("something went wrong with setting gambledRecently for everyone to false")
		}
	});
	var pogthief = new schedule.scheduleJob('15,45 * * * *', function () {
		try {
			pogsteal()
		}
		catch (err) {
			console.log(err)
		}
	});
}

function checkBannedWordsArray(message, bannedWords) {
	var emoji;
	for (emoji of bannedWords) {
		if (message.includes(emoji)) {
			return true;
		}
	}
	return false;
}

function listAllConnectedServersAndChannels() {
	console.log("Servers:")
	client.guilds.cache.forEach((guild) => {
		console.log(" - " + guild.name)
		guild.channels.cache.forEach((channel) => {
			console.log(` -- ${channel.name} (${channel.type}) - ${channel.id}`)
		})
	})

}

function getUserFromMention(mention) {
	if (!mention) return;

	if (mention.startsWith('<@') && mention.endsWith('>')) {
		mention = mention.slice(2, -1);

		if (mention.startsWith('!')) {
			mention = mention.slice(1);
		}

		return client.users.get(mention);
	}
}

function isInDB(arguments, receivedMessage) {
	console.log("Checking if " + receivedMessage.author.id + " is in Database...")
	database.findOne({ discordID: receivedMessage.author.id }, (err, data) => {
		if (data == null) {
			console.log('--can not find user: ' + receivedMessage.author.id + ', adding new entry')
			database.insert({ discordID: receivedMessage.author.id, username: receivedMessage.author.username, pogcoins: 300 });
			receivedMessage.channel.send("Registered user: " + receivedMessage.author.username);
		}
		else {
			console.log('--found User: ' + data.discordID);
			database.update({ discordID: data.discordID }, { $set: { username: receivedMessage.author.username } }, function (err, data) { console.log("Updated username for: " + receivedMessage.author.id) });
			receivedMessage.channel.send("Updating username of user: " + receivedMessage.author.username);
		}
	})
	return true;
}

function testCommand(arguments, receivedMessage) {
	//database.update({ discordID: data.discordID }, { $set: { username: receivedMessage.author.username } }, function (err, data) { console.log("Updated username for: " + receivedMessage.author.id) });
	//database.update({}, { $set: {gambledRecently: false}}, {multi: true}, function (err, data) {console.log("setting gambledRecently for everyone to false")})
	//database.insert({ discordID: "pogthief", username: "pogthief", pogcoins: 0, totalstolen: 0,  recentTarget: null, recentAmount: 0 , gambledRecently: false}, function (err, newDoc){})
	//pogsteal()
	//database.update({ discordID: "pogthief" }, { $set: { luckynumber: 167 } }, { multi: true }, function (err, numReplaced) { })

}
//*****************************************************************************************************************************
//RIOT API STUFF
async function getSummonerFromName(summonerName) {
	let getSummonerData = async () => {
		let summonerDataAPI = "https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/" + arguments[0] + "?api_key=" + riotAPIKey;
		let response = await axios.get(summonerDataAPI);
		let summonerData = response.data
		return summonerData;
	};
	let summoner = await getSummonerData();
	return summoner;
}
async function getMatchListFromSummoner(summoner) {
	let getMatchList = async () => {
		let matchListAPI = "https://na1.api.riotgames.com/lol/match/v4/matchlists/by-account/" + summoner.accountId + "?queue=420&season=13&api_key=" + riotAPIKey;
		console.log(matchListAPI);
		let response = await axios.get(matchListAPI);
		let matchlistData = response.data;
		return matchlistData;
	};
	let matchlist = await getMatchList();
	console.log(matchlist.matches);
	return matchlist.matches;
}

function getWinrateFromMatchlist(matchlist, summoner) {
	for (var i = 0; i < matchlist.length; i++) {
		var match = matchlist[i];
		console.log(match.gameId);
	}
}

async function getMatchDataFromGameId(gameid) {
	let getMatchData = async () => {
		let matchDataAPI = "https://na1.api.riotgames.com/lol/match/v4/matches/" + gameid + "?api_key=" + riotAPIKey;
		console.log(matchDataAPI);
		let response = await axios.get(matchDataAPI);
		let matchData = response.data;
		return matchData;
	};
	let matchData = await getMatchData();
	return matchData;
}

function getparticipantIdFromParticipantandSummoner(participants, summoner) {
	for (var i = 0; i < participants.length; i++) {
		//var participant
	}
}


//*****************************************************************************************************************************
//Pog Coin Commands
//pogcoin processing
function pogCoinCommand(arguments, receivedMessage) {
	console.log("pogcoin command from user: " + receivedMessage.author.id);
	switch (arguments[0]) {
		case "check":
			checkCoins(arguments, receivedMessage)
			break;
		/*
		case "add1":
			addOnePogCoin(arguments, receivedMessage)
			break;
		*/
		case "give":
			givePogcoins(arguments, receivedMessage)
			break;
		case "gamble":
			gamblePogCoinsSlot(arguments, receivedMessage)
			break;
		case "leaderboard":
			checkCoinLeaderboard(arguments, receivedMessage)
			break;
		case "help":
			pogcoinHelp(arguments, receivedMessage)
			break;
		case "mega":
			megapogmillion(arguments, receivedMessage)
			break;
		case "":
			break;
	}
}

function pogcoinHelp(arguments, receivedMessage) {
	var helpmsg = "";
	helpmsg += "```!register - registers you into the database"
	helpmsg += "\n!p check or !p check <@username> - checks how many pogcoins you or specified person has"
	helpmsg += "\n!p gamble <amount/all/min> - gamble your pogcoins away! rates are not favorable"
	helpmsg += "\n!p give <amount> <@username> - give your pogcoins to the specified person"
	helpmsg += "\n!p mega - roll for the mega pog million jackpot"
	helpmsg += "\n!p mega jackpot - displays mega pog million jackpot"
	helpmsg += "\n!p leaderboard <number or all>- displays pogcoin leaderboard```"
	receivedMessage.author.send(helpmsg)
}

function givePogcoins(arguments, receivedMessage) {
	try {
		let amount = arguments[1];
		if (checkIfStringIsValidInt(amount)) {
			console.log("valid amount: " + amount)
		}
		else {
			receivedMessage.channel.send("not a valid number to give!\n!p give <amount> <@username>")
			return;
		}
		amount = parseInt(arguments[1])
		let user1 = receivedMessage.author;
		let user2 = receivedMessage.mentions.users.first();
		giveUserPogcoins(user1, user2, amount, receivedMessage);
	}
	catch (err) {
		receivedMessage.channel.send("Something went wrong!\n!p give <amount> <@username>")
	}
}

function giveUserPogcoins(user1, user2, amount, receivedMessage) {
	let isRecipientInDatabase = true;
	if (amount <= 0) {
		receivedMessage.channel.send("Invalid Amount");
		return;
	}
	if (user1.id == user2.id) {
		receivedMessage.channel.send("cant give to yourself");
		return;
	}
	database.findOne({ discordID: user2.id }, function (err, data) {
		if (data == null) {
			receivedMessage.channel.send("Recipient not found in database, have them type !register")
			isRecipientInDatabase = false;
		}
	});
	database.findOne({ discordID: user1.id }, function (err, data) {
		if (data != null) {
			if (amount > data.pogcoins) {
				receivedMessage.channel.send("Insufficient pogcoins to give");
				return;
			}
			else if (isRecipientInDatabase) {
				console.log("User: " + user1.id + " giving User: " + user2.id + " " + amount + " pogcoins");
				changePogCoin(user2.id, amount);
				changePogCoin(user1.id, -amount);
				receivedMessage.channel.send("Giving " + amount + " pogcoins to " + user2.username + "!")
			}
		}
	});
}

function changePogCoin(authorID, amount) {
	database.findOne({ discordID: authorID }, (err, data) => {
		if (data != null) {
			database.update({ discordID: authorID }, { $inc: { pogcoins: amount } }, { multi: false }, function (err, numReplaced) { console.log("Changed User: " + authorID + " pogcoins by " + amount) });

		}
		else {
			//receivedMessage.channel.send("Could not find user, Try typing !register");
		}
	})
}

function changePogCoinBet(authorID, amount) {
	database.findOne({ discordID: authorID }, (err, data) => {
		if (data != null) {
			database.update({ discordID: authorID }, { $inc: { pogcoins: amount, spent: (amount < 0) ? Math.abs(amount) : 0, earned: (amount > 0) ? amount : 0 } }, { multi: true }, function (err, numReplaced) {
				console.log("Changed User: " + authorID + " pogcoins by " + amount)
			});
		}
		else {
			receivedMessage.channel.send("Could not find user, Try typing !register");
		}
	})
}

function addOnePogCoin(arguments, receivedMessage) {
	var aID;
	if (arguments.length > 2) {
		var aID = arguments[2];
	}
	else {
		var aID = receivedMessage.author.id;
	}
	changePogCoin(aID, 10)
}

function getPogCoinsFromDiscordID(discordID) {
	try {
		let pogcoinbalance = null;
		database.findOne({ discordID: discordID }, (err, data) => {
			if (data != null) {
				//receivedMessage.channel.send("User: " + author.username + " has " + data.pogcoins + " pogcoins!")
				//return data.pogcoins
				//console.log(data.pogcoins)
				let datacopy = JSON.parse(JSON.stringify(data))
				pogcoinbalance = datacopy.pogcoins
				return data.pogcoins
			}
			else {
				//receivedMessage.channel.send("User " + author.username + " not found, try typing !register");
				console.log("DISCORD_ID WAS NOT FOUND IN DATABASE")
			}
		})
		return pogcoinbalance
	}
	catch (err) {
		//receivedMessage.channel.send("Something went wrong")
		console.log("SOMETHING WENT WRONG WHEN TRYING TO GET POG COIN BALANCE FROM DISCORD ID")
	}
}

function checkCoins(arguments, receivedMessage) {
	try {
		if (arguments.length > 1) {
			checkUserCoins(receivedMessage.mentions.users.first(), receivedMessage);
			return;
		}
		database.findOne({ discordID: receivedMessage.author.id }, (err, data) => {
			if (data != null) {
				receivedMessage.channel.send(receivedMessage.author.username + " has: " + data.pogcoins + " pogcoins!")
			}
			else {
				receivedMessage.channel.send("User not found, try typing !register");
			}
		})
	}
	catch (err) {
		receivedMessage.channel.send("Something went wrong!\n!p check or !p check <@username>")
	}
}

function checkUserCoins(author, receivedMessage) {
	try {
		database.findOne({ discordID: author.id.toString() }, (err, data) => {
			if (data != null) {
				receivedMessage.channel.send(author.username + " has: " + data.pogcoins + " pogcoins!")
				//return data.pogcoins
			}
			else {
				receivedMessage.channel.send("User " + author.username + " not found, try typing !register");
			}
		})
	}
	catch (err) {
		receivedMessage.channel.send("Something went wrong")
	}
}

function checkCoinLeaderboard(arguments, receivedMessage) {
	try {
		if (arguments[1] == "all") {
			limit = Number.MAX_SAFE_INTEGER
		}
		else if (arguments[1] == null) {
			limit = 10;
		}
		else if (!checkIfStringIsValidInt(arguments[1])) {
			receivedMessage.channel.send("not a valid number!\n\!p leaderboard <number>")
			return;
		}
		else {
			limit = parseInt(arguments[1])
		}

		database.find({}).sort({ pogcoins: -1 }).exec(function (err, data) {
			if (data != null) {
				let amt = 0;
				fields = [["Name", "pogcoins"]];
				data.forEach(function (item) {
					if (item.gambledRecently == true && item.username != null && amt < limit) {
						fields.push([item.username, item.pogcoins]);
						amt++;
					}
				});
				receivedMessage.channel.send("```\n" + table.table(fields) + "```\n");
				receivedMessage.channel.send("Don't see your username? make sure you gambled today!");
			}
			else {
				receivedMessage.channel.send("DB error, perhaps it's empty?");
			}
		});
	}
	catch (err) {
		receivedMessage.channel.send("Something went wrong");
	}
}

function gamblePogCoinsSlot(arguments, receivedMessage) {
	try {
		database.findOne({ discordID: receivedMessage.author.id }, (err, data) => {
			if (data != null) {
				let authorID = receivedMessage.author.id;
				let pogcoinsAmount = data.pogcoins;
				gpcSlots(pogcoinsAmount, arguments, receivedMessage);
			}
			else {
				receivedMessage.channel.send("User " + receivedMessage.author.username + " not found, try typing !register");
			}
		})
	}
	catch (err) {
		receivedMessage.channel.send("Something went wrong!\n!p gamble <amount>")
	}
}

function gpcSlots(pogcoinsAmt, arguments, receivedMessage) {
	//let randRoll = Math.floor(Math.random() * Math.floor(100)) + 1;
	let rollAmount = arguments[1]
	let randArrayPlace = Math.floor(Math.random() * Math.floor(3))
	randArray = [Math.floor(Math.random() * Math.floor(100)) + 1, Math.floor(Math.random() * Math.floor(100)) + 1, Math.floor(Math.random() * Math.floor(100)) + 1]
	//console.log(randArray)
	let randRoll = randArray[randArrayPlace]
	console.log(randArrayPlace + " " + randArray)
	let imgurl = "https://i.imgur.com/MvUYFja.png";
	let emsg = "Something went wrong if this was sent";
	let winamount = 0;
	//console.log(parseInt(rollAmount, 10))
	if (rollAmount == "all") {
		rollAmount = pogcoinsAmt;
	}
	if (rollAmount == "min") {
		rollAmount = Math.round(.05 * pogcoinsAmt)
	}
	else if (checkIfStringIsValidInt(rollAmount)) {

	}
	else {
		receivedMessage.channel.send("not a valid number to gamble!\n!p gamble <amount>")
		return;
	}
	let authID = receivedMessage.author.id
	if (rollAmount < Math.round(.05 * pogcoinsAmt)) {
		receivedMessage.channel.send("minimum amount to roll is 5% of your pog coins\nthe minimum for " + receivedMessage.author.username + " is: " + Math.round(.05 * pogcoinsAmt) + " pogcoins")
		console.log("minimum to roll is 5%")
		return;
	}
	if (rollAmount > pogcoinsAmt) {
		receivedMessage.channel.send("Insufficient pogcoins to gamble")
		console.log("insufficient pogcoins to roll")
		return;
	}
	if (rollAmount < 10) {
		receivedMessage.channel.send("minimum pogcoins to roll is 10")
		return;
	}
	console.log(authID + " rolled: " + randRoll + " gambled: " + rollAmount + " pog coins!");
	changePogCoinBet(authID, -rollAmount);
	if (randRoll >= 1 && randRoll < 3) {
		winamount = 5 * rollAmount;
		changePogCoinBet(authID, winamount)
		imgurl = "https://i.imgur.com/lsMhWZA.png" // pepering
		emsg = "(5x) HOLY MOTHER OF POG!!! You won " + winamount + " pogcoins!";

	}
	else if (randRoll >= 3 && randRoll < 7) {
		winamount = 3 * rollAmount;
		changePogCoinBet(authID, winamount)
		imgurl = "https://i.imgur.com/0bNq11b.png" //pepepoggers
		emsg = "(3x) WOW POG! You won " + winamount + " pogcoins!";
	}
	else if (randRoll >= 7 && randRoll < 13) {
		winamount = 2 * rollAmount;
		changePogCoinBet(authID, winamount)
		imgurl = "https://i.imgur.com/i41RLFv.png" //pepestonks
		emsg = "(2x) DOUBLE DOUBLE!! You won " + winamount + " pogcoins!";

	}
	else if (randRoll >= 13 && randRoll < 25) {
		let halfamount = Math.round(.3 * rollAmount)
		winamount = 1 * rollAmount + 1 * halfamount
		changePogCoinBet(authID, 1 * winamount)
		imgurl = "https://i.imgur.com/SLffH3s.png" //pepecheer
		emsg = "(1.3x) NOT BAD! You won " + winamount + " pogcoins!";
	}
	else if (randRoll >= 25 && randRoll < 38) {
		winamount = 1 * rollAmount;
		changePogCoinBet(authID, winamount)
		imgurl = "https://i.imgur.com/D5Q8pG1.png" //pepeignore
		emsg = "(1x) You lost nothing!"
	}
	else if (randRoll >= 38 && randRoll < 63) {
		let halfamount = Math.round(.5 * rollAmount)
		changePogCoinBet(authID, halfamount)
		winamount = halfamount;
		imgurl = "https://i.imgur.com/JjPZsJr.png" //pepefeelsbad
		emsg = "(.5x) You got " + winamount + " pogcoins back"

	}
	else if (randRoll >= 63 && randRoll < 81) {
		let quarteramount = Math.round(.25 * rollAmount)
		changePogCoinBet(authID, quarteramount)
		winamount = quarteramount;
		imgurl = "https://i.imgur.com/YEuQ2iY.png" //pepesadge
		emsg = "(.25x) Sad, at least you got " + winamount + " pogcoins back";
	}
	else {
		winamount = 0;
		imgurl = "https://i.imgur.com/L37ZPeW.png" //pepekms
		emsg = "(0x) You got nothing and lost " + rollAmount + " pogcoins"
	}

	database.update({ discordID: receivedMessage.author.id }, { $set: { gambledRecently: true } }, { multi: false }, function (err, data) { console.log("setting gambledRecently for " + receivedMessage.author.id + " to true") })
	
	//add to mega pog million pot
	changePogCoin("pogthief", Math.round(rollAmount * .3))

	const embed = new Discord.MessageEmbed()
		//.setColor()
		.setTitle("You gambled " + rollAmount + " pogcoins!")
		.setAuthor("pog-sino", "https://i.imgur.com/MvUYFja.png")
		.setThumbnail(imgurl)
		.setFooter(receivedMessage.author.username + " now has " + (pogcoinsAmt - rollAmount + winamount) + " pogcoins!")
		.setDescription("```" + emsg + "```");

	receivedMessage.channel.send({ embed });
}

function pogsteal() {
	database.find({}).sort({ pogcoins: -1 }).exec(function (err, data) {
		if (data != null) {
			let amt = 3;
			//fields = [["Name", "pogcoins"]];
			data.forEach(function (item) {
				if (item.username != null && amt > 0) {
					pogcoinstolen = Math.round((amt / 100) * item.pogcoins)
					changePogCoin(item.discordID, -pogcoinstolen)
					database.update({ discordID: "pogthief" }, { $inc: { pogcoins: pogcoinstolen } }, { multi: true }, function (err, numReplaced) { });
					database.update({ discordID: "pogthief" }, { $inc: { totalstolen: pogcoinstolen } }, { multi: true }, function (err, numReplaced) { });
					console.log("stealing " + pogcoinstolen + " pogcoins from " + item.username)
					amt--;
				}
			});
		}
		else {
			receivedMessage.channel.send("DB error, perhaps it's empty?");
		}
	});
}

function megapogmillion(arguments, receivedMessage) {
	const megapogmillioncost = 100
	//const luckynumber = 111
	let command = arguments[1]
	if (command == "jackpot") {
		database.findOne({ discordID: "pogthief" }, (err, data) => {
			receivedMessage.channel.send("The current Mega Pog Million Jackpot is " + data.pogcoins + " pogcoins!");
		})
	}
	else if (command == null) {
		console.log("megapogmillion roll")
		database.findOne({ discordID: receivedMessage.author.id }, (err, data) => {
			if (data == null || data.pogcoins == null) {
				receivedMessage.channel.send("Something went wrong, try registering with !register")
			}
			else if (data.pogcoins < megapogmillioncost) {
				receivedMessage.channel.send("Insufficient pogcoins to gamble, you need 100 pog coins")
			}
			else {
				//database.update({ discordID: receivedMessage.author.id }, { $set: { gambledRecently: true } }, { multi: false }, function (err, data) { console.log("setting gambledRecently for " + receivedMessage.author.id + " to true") })
				changePogCoin(receivedMessage.author.id, -megapogmillioncost);
				changePogCoin("pogthief", Math.round(megapogmillioncost * .25));
				database.findOne({ discordID: "pogthief" }, (err, pogthief) => {
					let randRoll = Math.floor(Math.random() * Math.floor(1000)) + 1;
					if (randRoll == pogthief.luckynumber) {
						const embed = new Discord.MessageEmbed()
							.setAuthor("MEGA-POG-MILLIONS", "https://i.imgur.com/MvUYFja.png")
							.setThumbnail("https://i.imgur.com/W5U5KXa.png") //pepeking
							.setFooter(receivedMessage.author.username + " now has " + (data.pogcoins + pogthief.pogcoins) + " pogcoins!")
							.setDescription("```" + "MEGA POGGERINOS YOU WON THE MEGA POG MILLION JACKPOT OF " + pogthief.pogcoins + " POGCOINS!" + "```");
						receivedMessage.channel.send({ embed });

						changePogCoin(receivedMessage.author.id, pogthief.pogcoins)
						database.update({ discordID: "pogthief" }, { $set: { pogcoins: 0 } }, { multi: false }, function (err, numReplaced) { })

						//change lucky number
						let newluckynumber = Math.floor(Math.random() * Math.floor(1000)) + 1;
						database.update({ discordID: "pogthief" }, { $set: { luckynumber: newluckynumber } }, { multi: false }, function (err, numReplaced) { })
					}
					else {
						const embed = new Discord.MessageEmbed()
							.setTitle("Mega Pog Million Jackpot is " + pogthief.pogcoins + " pogcoins!")
							.setAuthor("MEGA-POG-MILLIONS", "https://i.imgur.com/MvUYFja.png")
							.setThumbnail("https://i.imgur.com/JjPZsJr.png")
							.setFooter(receivedMessage.author.username + " now has " + (data.pogcoins - megapogmillioncost) + " pogcoins!")
							.setDescription("```" + "Unlucky! You rolled: " + randRoll + " and the winning number is: " + pogthief.luckynumber + "```");

						receivedMessage.channel.send({ embed });
					}
				})
			}
		})
	}
	else {
		receivedMessage.channel.send("not a valid mega pog million command!\n!p mega <jackpot/null>")
		return;
	}
}


function checkIfStringIsValidInt(input) {
	if (isNaN(input)) {
		return false
	}
	else {
		if (Number(input) === parseInt(input, 10)) {
			return true
		}
		else {
			return false
		}
	}
}

//*****************************************************************************************************************************
function processCommand(receivedMessage) {
	let fullCommand = receivedMessage.content.substr(1) // Remove the leading exclamation mark
	let splitCommand = fullCommand.split(" ") // Split the message up in to pieces for each space
	//let splitCommand = fullCommand.split(/ +/) // Split the message up in to pieces for each space
	let primaryCommand = findCommand(splitCommand[0].toLowerCase()) // The first word directly after the exclamation is the command
	let arguments = splitCommand.slice(1) // All other words are arguments/parameters/options for the command
	//console.log(arguments)
	let re = new RegExp("^[a-zA-Z0-9]*$")
	//console.log(splitCommand[0].toLowerCase())
	if (splitCommand[0].toLowerCase() == "test" && receivedMessage.author.id == "125805688797659138") {
		console.log("running test command")
		testCommand(arguments, receivedMessage)
	}
	if (fullCommand == null || fullCommand.startsWith("!", 0) || !re.test(primaryCommand)) {
		return;
	}
	else {
		console.log("Command Received from User: " + receivedMessage.author.id + " \n --Command: " + primaryCommand + " with Arguments: " + arguments)
		switch (primaryCommand) {
			case "Invalid_Command":
				invalidCommand(arguments, receivedMessage)
				break;
			case "help":
				helpCommand(arguments, receivedMessage)
				break;
			case "opgg":
				opggCommand(arguments, receivedMessage)
				break;
			case "aopgg":
				allOpggCommand(arguments, receivedMessage)
				break;
			case "champ":
				champggCommand(arguments, receivedMessage)
				break;
			case "meme":
				memeifyChatCommand(arguments, receivedMessage)
				break;
			case "cr":
				caeserRodneyCommand(arguments, receivedMessage)
				break;
			case "pencader":
				pencaderCommand(arguments, receivedMessage)
				break;
			case "pogplant":
				pogPlantImageCommand(arguments, receivedMessage)
				break;
			case "8ball":
				magic8BallCommand(arguments, receivedMessage)
				break;
			case "dog":
				try {
					dogCommand(arguments, receivedMessage)
				} catch (e) {
					console.error(e)
				}
				break;
			/*
			case "cat":
				catCommand(arguments, receivedMessage)
				break;
			*/
			case "register":
				isInDB(arguments, receivedMessage)
				break;
			case "pogcoins":
				pogCoinCommand(arguments, receivedMessage)
				break;
			case "coin":
				coinflipCommand(arguments, receivedMessage)
				break;
			case "roll":
				rollCommand(arguments, receivedMessage)
				break;
			case "music":
				musicCommand(arguments, receivedMessage)
				break;
			/*
			case "play":
				playCommand(arguments, receivedMessage)
				break;
			*/
			case "":
				break;
		}
	}
}

function findCommand(primaryCommand) {
	for (var listNum = 0; listNum < allCommands.length; listNum++) {
		//List of Commands
		for (var commandNum = 0; commandNum < allCommands[listNum].length; commandNum++) {
			//Command in List
			if (primaryCommand == allCommands[listNum][commandNum]) {
				console.log(allCommands[listNum][0])
				return allCommands[listNum][0]
			}
		}
	}
	console.log("Invalid_Command")
	return "Invalid_Command"
}


//command functions
function invalidCommand(arguments, receivedMessage) {
	receivedMessage.channel.send("Invalid Command, try typing \"!help\" for the list of commands")
}

function helpCommand(arguments, receivedMessage) {
	var returnMsg = "```";
	allCommands.forEach((commandList) => {
		if (commandList[0] != "") {
			returnMsg += "!" + commandList[0] + ", "
		}
	})
	returnMsg = returnMsg.substring(0, returnMsg.length - 2)
	returnMsg += "```"
	receivedMessage.author.send(returnMsg)
}

function opggCommand(arguments, receivedMessage) {
	/*
	if (arguments.length > 1) {
		var msg = "https://na.op.gg/multi/query=";
		arguments.forEach((value) => {
			msg = msg + value + "%2C"
		})
		msg = msg.substring(0, msg.length - 3)
		receivedMessage.channel.send(msg)
	}
	else {
		receivedMessage.channel.send("https://na.op.gg/summoner/userName=" + arguments[0])
	}
	*/
	var summonerName = "";
	arguments.forEach((value) => {
		summonerName += value + "+"
	})
	receivedMessage.channel.send("https://na.op.gg/summoner/userName=" + summonerName.substring(0, summonerName.length - 1))
}

function allOpggCommand(arguments, receivedMessage) {
	var name = arguments[0]
	if (name == "Herson" || name == "Joe" || name == "Joseph" || name == "joe" || name == "herson" || name == "joseph") {
		receivedMessage.channel.send("https://na.op.gg/multi/query=herson%2Cscaredypoop")
	}
	else if (name == "flexq") {
		receivedMessage.channel.send("https://na.op.gg/multi/query=lifeingrey%2Cnightstealth%2CSixer%2Cbloxipus%2Cmire")
	}
	else if (name == "mic" || name == "mike" || name == "Mic" || name == "midget" || name == "Mike") {
		receivedMessage.channel.send("https://na.op.gg/multi/query=eastcoastcarry%2Cicansavethem%2Ctokyotraphouse%2Cdemonsxd")
	}
	else {
		receivedMessage.channel.send("Invalid Input")
	}
}

function champggCommand(arguments, receivedMessage) {
	var championName = arguments[0];
	var role = arguments[1];
	if (arguments.length == 1) {
		receivedMessage.channel.send("https://na.op.gg/champion/" + championName + "/statistics")
	}
	else if (role == "top") {
		receivedMessage.channel.send("https://na.op.gg/champion/" + championName + "/statistics/top")
	}
	else if (role == "jg" || role == "jungle" || role == "jung") {
		receivedMessage.channel.send("https://na.op.gg/champion/" + championName + "/statistics/jungle")
	}
	else if (role == "mid" || role == "middle") {
		receivedMessage.channel.send("https://na.op.gg/champion/" + championName + "/statistics/mid")
	}
	else if (role == "adc" || role == "ad" || role == "bot" || role == "bottom") {
		receivedMessage.channel.send("https://na.op.gg/champion/" + championName + "/statistics/bot")
	}
	else if (role == "supp" || role == "sup" || role == "support") {
		receivedMessage.channel.send("https://na.op.gg/champion/" + championName + "/statistics/support")
	}
	else {
		receivedMessage.channel.send("Incorrect Input: !champ [champion name] [position/role]")
	}
}

function memeifyChatCommand(arguments, receivedMessage) {
	var msg = "";
	arguments.forEach((value) => {
		msg = msg + value + " "
	})
	msg = msg.substring(0, msg.length - 1)
	var i;
	var returnMsg = "";
	for (i = 0; i < msg.length; i++) {
		if (msg.charAt(i) != " ") {
			if (Math.floor(Math.random() * 2) == 0) {
				returnMsg = returnMsg + msg.charAt(i).toLowerCase();
			}
			else {
				returnMsg = returnMsg + msg.charAt(i).toUpperCase();
			}
		}
		else {
			returnMsg = returnMsg + " ";
		}
	}
	returnMsg = returnMsg.substring(0, returnMsg.length)
	receivedMessage.channel.send(returnMsg);
}

function caeserRodneyCommand(arguments, receivedMessage) {
	receivedMessage.channel.send("https://udel.campusdish.com/LocationsAndMenus/CaesarRodneyFreshFoodCompany")
}

function pencaderCommand(arguments, receivedMessage) {
	receivedMessage.channel.send("https://udel.campusdish.com/LocationsAndMenus/PencaderResidentialDining")
}
function pogPlantImageCommand(arguments, receivedMessage) {
	if (arguments[0] == 'bonk') {
		receivedMessage.channel.send(new Discord.MessageAttachment('images/bonk.jpg'))
		return;
	}
	receivedMessage.channel.send(new Discord.MessageAttachment('images/pogplant.png'))
}

async function dogCommand(arguments, receivedMessage) {
	if (arguments[0] == 'john' || arguments[0] == 'kamba') {
		receivedMessage.channel.send("https://na.op.gg/summoner/userName=kamba")
		return;
	}
	else if (arguments[0] == 'yuri' || arguments[0] == 'yoori') {
		receivedMessage.channel.send("https://na.op.gg/summoner/userName=yuri%20the%20dog")
		return;
	}
	else if (arguments[0] == 'yj' || arguments[0] == 'kalbean' || arguments[0] == 'yunjin') {
		try {
			receivedMessage.channel.send(new Discord.MessageAttachment('images/heads.png'))
		}
		catch (e) {
			console.log(e)
		}
		finally {
			return;
		}
	}
	let getDog = async () => {
		let dogAPI = "https://dog.ceo/api/breeds/image/random";
		if (arguments.length == 1) {
			/*
			if(arguments[0] == 'john'){
				receivedMessage.channel.send("https://na.op.gg/summoner/userName=kamba")
				return;
			}
			else{
				dogAPI = 'https://dog.ceo/api/breed/' + arguments[0] + '/images/random'
			}
			*/
			dogAPI = 'https://dog.ceo/api/breed/' + arguments[0] + '/images/random'
		}
		else if (arguments.length == 2) {
			dogAPI = 'https://dog.ceo/api/breed/' + arguments[1] + '/' + arguments[0] + '/images/random'
		}
		else {
			//receivedMessage.channel.send("Either dog does not exist or I broke :(");
		}

		try {
			let response = await axios.get(dogAPI);
			let dogData = response.data
			return dogData;
		} catch (err) {
			console.log("error getting dog from api");
		}
	};
	let dogImg;
	try {
		dogImg = await getDog();
		receivedMessage.channel.send(dogImg.message);
	} catch (err) {
		console.log("error with reading dog message")
		receivedMessage.channel.send("Either dog does not exist or I broke :(");
	}
}

async function catCommand(arguments, receivedMessage) {
	//https://api.thecatapi.com/v1/images/search
	let getCat = async () => {
		let catAPI = 'https://api.thecatapi.com/v1/images/search'
		let response = await axios.get(catAPI);
		let catData = response.data
		return catData;
	};
	let catImg = await getCat();
	receivedMessage.channel.send(catImg.url);
}

function coinflipCommand(arguments, receivedMessage) {
	const m8ballCommand = Math.floor(Math.random() * 2);
	if (m8ballCommand == 1) {
		receivedMessage.channel.send(new Discord.MessageAttachment('images/heads.png'))
		console.log(" --flipped heads")
	}
	else {
		receivedMessage.channel.send(new Discord.MessageAttachment('images/tails.png'))
		console.log(" --flipped tails")
	}

}

function rollCommand(arguments, receivedMessage) {
	receivedMessage.channel.send(receivedMessage.author.username + " rolled: " + Math.floor(Math.random() * parseInt(arguments[0], 10) + 1) + " out of " + arguments[0]);
}

function musicCommand(arguments, receivedMessage) {
	switch (arguments[0]) {
		case "play":
			function playSong(connection, receivedMessage) {
				var server = servers[receivedMessage.guild.id];
				server.dispatcher = connection.play(ytdl(server.queue[0], { filter: "audioonly" }));
				server.queue.shift();
				server.dispatcher.on("finish", function () {
					if (server.queue[0]) {
						playSong(connection, receivedMessage);
					}
					else {
						connection.disconnect();
					}
				});
			}

			if (!arguments[1]) {
				receivedMessage.channel.send("Provide a valid link");
				return;
			}
			if (!receivedMessage.member.voice.channel) {
				receivedMessage.channel.send("Please join a channel");
				return;
			}
			if (!servers[receivedMessage.guild.id]) servers[receivedMessage.guild.id] = {
				queue: []
			}

			var server = servers[receivedMessage.guild.id];
			server.queue.push(arguments[1]);
			console.log(server.queue + " " + arguments[1]);

			//if (!receivedMessage.guild.voiceConnection) receivedMessage.member.voice.channel.join().then(function (connection) {
			if (!receivedMessage.member.voice.connection) receivedMessage.member.voice.channel.join().then(function (connection) {
				playSong(connection, receivedMessage);
			})
			break;
		case "stop":
			var server = servers[receivedMessage.guild.id];
			if (receivedMessage.guild.voiceConnection) {
				for (var i = server.queue.length - 1; i >= 0; i--) {
					server.queue.splice(i, 1);
				}
				server.dispatcher.end();
				receivedMessage.channel.send("stopping");
				console.log("stopping");
			}
			//if(receivedMessage.guild.connection) receivedMessage.guild.voiceConnection.disconnect();
			//connection.disconnect();
			break;
		case "skip":
			var server = servers[receivedMessage.guild.id];
			if (server.dispatcher) server.dispatcher.end();
			receivedMessage.channel.send("Skipping Song");
			break;
		case "":
			break;
	}
}

function playCommand(arguments, receivedMessage) {

	function play(connection, receivedMessage) {
		var server = servers[receivedMessage.guild.id];
		server.dispatcher = connection.play(ytdl(server.queue[0], { filter: "audioonly" }));
		server.queue.shift();
		server.dispatcher.on("end", function () {
			if (server.queue[0]) {
				play(connection, receivedMessage);
			}
			else {
				connection.disconnect();
			}
		});
	}

	if (!arguments[1]) {
		receivedMessage.channel.send("Provide a valid link");
		return;
	}
	if (!receivedMessage.member.voice.channel) {
		receivedMessage.channel.send("Please join a channel");
		return;
	}
	if (!servers[receivedMessage.guild.id]) servers[receivedMessage.guild.id] = {
		queue: []
	}

	var server = servers[receivedMessage.guild.id];
	server.queue.push(arguments[1]);

	if (!receivedMessage.guild.voiceConnection) receivedMessage.member.voice.channel.join().then(function (connection) {
		play(connection, receivedMessage);
	})
}

function pauseCommand(arguments, receivedMessage) {
	var server = servers[message.guild.id];
	if (message.guild.voiceConnection) {
		for (var i = server.queue.length - 1; i >= 0; i--) {
			server.queue.splice(i, 1);
		}
	}

	server.dispatcher.end();
	receivedMessage.channel.send("Ending queue, leaving channel");
}

function skipCommand(arguments, receivedMessage) {
	var server = servers[receivedMessage.guild.id];
	if (server.dispatcher) server.dispatcher.end();
	receivedMessage.channel.send("Skipping Song");
}

function magic8BallCommand(arguments, receivedMessage) {
	const m8ballCommand = Math.floor(Math.random() * 20);
	const m8ballColor = (m8ballCommand % 4);
	const m8ballAnswers = ["It is certain.", "As I see it, yes.", "Reply hazy, try again.", "Don't count on it.",
		"It is decidedly so.", "Most likely.", "Ask again later.", "My reply is no.",
		"Without a doubt.", "Outlook good.", "Better not tell you now.", "My sources say no.",
		"Yes - definitely.", "Yes.", "Cannot predict now.", "Outlook not so good.",
		"You may rely on it.", "Signs point to yes.", "Concentrate and ask again.", "Very doubtful."];

	let m8ballC = 0x000000;
	switch (m8ballColor) {
		case 0:
			m8ballC = 0x6ac06a
			break;
		case 1:
			m8ballC = 0x6ac06a
			break;
		case 2:
			m8ballC = 0xffd740
			break;
		case 3:
			m8ballC = 0xdb423c
			break;
	}

	const embed = new Discord.MessageEmbed()
		.setColor(m8ballC)
		.setAuthor("Magic Pog-Ball", "https://i.imgur.com/HAve7tX.png")
		.setThumbnail("https://i.imgur.com/HAve7tX.png")
		.setDescription("```" + m8ballAnswers[m8ballCommand] + "```");

	receivedMessage.channel.send({ embed });
}