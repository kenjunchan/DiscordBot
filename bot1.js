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

//var lastSentMsg;
var servers = {};
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
const catCommands = ["cat"];
const registerCommands = ["register"];
const pCommands = ["pogcoins", "p"];
const coinflipCommands = ["coin"]
const rollCommands = ["roll"]
const musicCommands = ["music", "m"]
const playCommands = ["play"]
const emptyCommands = [""];

const allCommands = [helpCommands, opggCommands, allOpggCommands, championCommands, memeifyCommands, caesarRodneyCommands, pencaderCommands,
	pogPlantImageCommands, magic8BallCommands, dogCommands, catCommands, registerCommands, pCommands, coinflipCommands, rollCommands, musicCommands, playCommands, emptyCommands];


//Load Database
const database = new Datastore('datastore.db');
database.loadDatabase();

const dbCompactInterval = 60000; //number in miliseconds
//*****************************************************************************************************************************
client.on('ready', () => {
	client.user.setActivity("dont look at me im ugly")
	listAllConnectedServersAndChannels()
	console.log("DiscordBot Started")
	console.log("Setting Automatic Database Compaction to " + dbCompactInterval + " ms")
	database.persistence.setAutocompactionInterval(dbCompactInterval)
})

client.on('message', (receivedMessage) => {
	if (receivedMessage.author == client.user) {
		return
	}
	else if (receivedMessage.content.startsWith("!")) { //!command
		processCommand(receivedMessage)
	}
	if (receivedMessage.content.includes(client.user.toString())) { //if bot is tagged in message

	}
})

function listAllConnectedServersAndChannels() {
	console.log("Servers:")
	/*
	client.guilds.forEach((guild) => {
		console.log(" - " + guild.name)
		guild.channels.forEach((channel) => {
			console.log(` -- ${channel.name} (${channel.type}) - ${channel.id}`)
		})
	})
	*/
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
			database.insert({ discordID: receivedMessage.author.id, pogcoins: 0 });
		}
		else {
			console.log('--found User: ' + data.discordID);
		}
	})
	return true;
}

async function testCommand(arguments, receivedMessage) {
	let s1 = await getSummonerFromName(arguments[0]);
	let m1 = await getMatchListFromSummoner(s1);
	getWinrateFromMatchlist(m1, s1);
	//receivedMessage.channel.send(summoner.id + " " + summoner.accountId);
}
//*****************************************************************************************************************************
//RIOT API STUFF
async function getSummonerFromName(summonerName) {
	let getSummonerData = async () => {
		let summonerDataAPI = "https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/" + arguments[0] + "?api_key=" + riotAPIKey;
		//console.log(summonerDataAPI);
		let response = await axios.get(summonerDataAPI);
		let summonerData = response.data
		//console.log(summonerData);
		return summonerData;
	};
	let summoner = await getSummonerData();
	//receivedMessage.channel.send(summoner.id + " " + summoner.accountId);
	//console.log(summoner);
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
	//console.log(matchlist)
	/*
	for (var match in matchlist){
		console.log(match.gameId);
	}
	*/
	for (var i = 0; i < matchlist.length; i++) {
		var match = matchlist[i];
		console.log(match.gameId);
		//var matchData = getMatchDataFromGameId(match.gameId);

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
		case "add1":
			addOnePogCoin(arguments, receivedMessage)
			break;
		case "give":
			givePogcoins(arguments, receivedMessage)
			break;
		case "":
			break;
	}
}

function givePogcoins(arguments, receivedMessage) {
	let amount = parseInt(arguments[1]);
	let userID1 = receivedMessage.author.id;
	let userID2 = receivedMessage.mentions.users.first().id.toString();
	giveUserPogcoins(userID1, userID2, amount, receivedMessage);
}

function giveUserPogcoins(user1, user2, amount, receivedMessage) {

	if (amount <= 0) {
		receivedMessage.channel.send("Invalid Amount");
		return;
	}
	if (user1 == user2) {
		receivedMessage.channel.send("cant give to yourself");
		return;
	}
	database.findOne({ discordID: user1 }, function (err, data) {
		if (data != null) {
			if (amount > data.pogcoins) {
				receivedMessage.channel.send("Insufficient pogcoins to give");
				return;
			}
			else {
				console.log("User: " + user1 + " giving User: " + user2 + " " + amount + " pogcoins");
				changePogCoin(user2, amount);
				changePogCoin(user1, -amount);
				receivedMessage.channel.send("-- sent pogcoins!")
			}
		}
	});
}

function changePogCoin(authorID, amount) {
	database.findOne({ discordID: authorID }, (err, data) => {
		if (data != null) {
			database.update({ discordID: authorID }, { $inc: { pogcoins: amount } }, { multi: true }, function (err, numReplaced) { console.log("Changed User: " + authorID + " pogcoins by " + amount) });
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
	changePogCoin(aID, parseInt(arguments[1]))
}



function checkCoins(arguments, receivedMessage) {
	if (arguments.length > 1) {
		checkUserCoins(receivedMessage.mentions.users.first(), receivedMessage);
		return;
	}
	database.findOne({ discordID: receivedMessage.author.id }, (err, data) => {
		if (data != null) {
			receivedMessage.channel.send("You have: " + data.pogcoins + " pogcoins!")
		}
		else {
			receivedMessage.channel.send("User not found, try typing !register");
		}
	})
}

function checkUserCoins(author, receivedMessage) {
	database.findOne({ discordID: author.id.toString() }, (err, data) => {
		if (data != null) {
			receivedMessage.channel.send("User: " + author.username + " has " + data.pogcoins + " pogcoins!")
		}
		else {
			receivedMessage.channel.send("User " + author.username + " not found ");
		}
	})
}

//*****************************************************************************************************************************
function processCommand(receivedMessage) {
	let fullCommand = receivedMessage.content.substr(1) // Remove the leading exclamation mark
	//let splitCommand = fullCommand.split(" ") // Split the message up in to pieces for each space
	let splitCommand = fullCommand.split(/ +/) // Split the message up in to pieces for each space
	let primaryCommand = findCommand(splitCommand[0].toLowerCase()) // The first word directly after the exclamation is the command
	let arguments = splitCommand.slice(1) // All other words are arguments/parameters/options for the command
	//console.log(arguments)
	if (fullCommand == null || fullCommand.startsWith("!", 0)) {
		return;
	}
	if (splitCommand[0].toLowerCase() == "test") {
		testCommand(arguments, receivedMessage)
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
			case "cat":
				catCommand(arguments, receivedMessage)
				break;
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
				return allCommands[listNum][0]
			}
		}
	}
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
	if (arguments.length > 1) {
		var msg = "https://na.op.gg/multi/query=";
		arguments.forEach((value) => {
			if (value == "brad") {
				msg = msg + "braddddddd" + "%2C"
			}
			else {
				msg = msg + value + "%2C"
			}
		})
		msg = msg.substring(0, msg.length - 3)
		receivedMessage.channel.send(msg)
	}
	else {
		if (arguments[0] == "brad") {
			receivedMessage.channel.send("https://na.op.gg/summoner/userName=braddddddd")
		}
		else {
			receivedMessage.channel.send("https://na.op.gg/summoner/userName=" + arguments[0])
		}
	}
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
			receivedMessage.channel.send(new Discord.Attachment('images/heads.png'))
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
		receivedMessage.channel.send(new Discord.Attachment('images/heads.png'))
		console.log(" --flipped heads")
	}
	else {
		receivedMessage.channel.send(new Discord.Attachment('images/tails.png'))
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
				server.dispatcher.on("end", function () {
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

	const embed = new Discord.RichEmbed()
		.setColor(m8ballC)
		.setAuthor("Magic Pog-Ball", "https://i.imgur.com/HAve7tX.png")
		.setThumbnail("https://i.imgur.com/HAve7tX.png")
		.setDescription("```" + m8ballAnswers[m8ballCommand] + "```");

	receivedMessage.channel.send({ embed });
}