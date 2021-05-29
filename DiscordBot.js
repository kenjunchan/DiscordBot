/**
 * Copy of Bot1.js to migrate
 */



const Discord = require('discord.js')
const client = new Discord.Client();
client.login("") //Discord Token Here
const riotAPIKey = ""; //Riotgames API key here
const riotTFTAPIKey = ""; //Riotgames TFT API key here
const testerID = "125805688797659138";
const ytdl = require("ytdl-core");
const axios = require('axios');
const Datastore = require('nedb');
var schedule = require('node-schedule');
const table = require('table');

const tiktokChannel = "848067671224221696";

//var lastSentMsg;
var servers = {};
var bannedWords = ["<:pepering:760989004244975641>", "💍"];
//List of Commands Avalible
const testCommands = ["test", "t"];
const helpCommands = ["help"];
const opggCommands = ["opgg", "op.gg"];
const allOpggCommands = ["aopgg", "a.op.gg"];
const soloQStatsCommands = ["soloq", "solo", "s"];
const tftQStatsCommands = ["tftq", "tft"];
const championCommands = ["champ", "ch"];
const memeifyCommands = ["meme", "me"];
const pogPlantImageCommands = ["pogplant", "pp"];
const magic8BallCommands = ["8ball", "magic", "8", "magic8ball", "m8"];
const dogCommands = ["dog"];
const coinflipCommands = ["coin", "c"]
const emptyCommands = [""];

const allCommands = [testCommands, helpCommands, opggCommands, allOpggCommands, soloQStatsCommands, tftQStatsCommands, championCommands, memeifyCommands, pogPlantImageCommands, magic8BallCommands, dogCommands, coinflipCommands, emptyCommands];

//Load Database
const database = new Datastore('pogplantdatastore.db');
database.loadDatabase();

const dbCompactInterval = 60000; //number in miliseconds
//*****************************************************************************************************************************
client.on('ready', () => {
	client.user.setActivity("meow >w<")
	listAllConnectedServersAndChannels()
	console.log("DiscordBot Started")
	console.log("Setting Automatic Database Compaction to " + dbCompactInterval + " ms")
	database.persistence.setAutocompactionInterval(dbCompactInterval)
	//globalCronjobs()
})

client.on('message', (receivedMessage) => {
	if (receivedMessage.author == client.user) {
		return
	}
	else if (receivedMessage.content.startsWith("!")) { //!command
		processCommand(receivedMessage)
	}
	if (receivedMessage.content.includes(client.user.toString())) { //if bot is tagged in message
		//does nothing
	}
	let re = RegExp("https://vm.tiktok.com/\\w{9}/"); //this eneds to be improved so that it just searches if the message contains this re and not exact matching
	if(receivedMessage.channel == tiktokChannel && re.test(receivedMessage.content)){
		receivedMessage.react('👍').then(() => receivedMessage.react('👎'));
	}
})

function globalCronjobs() {
	var danjaywalker = new schedule.scheduleJob('0 20 * * *', function () {
		try {
			client.channels.cache.get('697447991367303188').send("https://na.op.gg/multi/query=dayuni%2Cajaywalker");
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

function getWinrate(wins, losses){
	if((wins + losses) == 0){
		return 0;
	}
	return (wins/(wins + losses));
}

async function testCommand(arguments, receivedMessage) {
	if(receivedMessage.author.id != testerID){
		return;
	}
	let SoloqStats = await getTFTQStatsFromSummonerID(await getSummonerIDFromSummoner(await getTFTFromName([arguments.join('')])));
	//console.log(SoloqStats)
	if(SoloqStats == null){
		receivedMessage.channel.send("Summoner Not Found");
	}

	const embedMessage = new Discord.MessageEmbed()
		.setAuthor(SoloqStats['summonerName'])													
	
	let rankedIconURL = "https://i.imgur.com/XXsF8SZ.png" // default silver
	let colorHEX = "#A0B5BA" // default silver
	let eTitle = ""
	let eDesc = ""
	switch(SoloqStats['tier']){
		case 'IRON':
			eTitle += "Iron " + SoloqStats['rank']
			colorHEX = "#4F4F4F"
			rankedIconURL = "https://i.imgur.com/93pc8Ws.png"
			break;
		case 'BRONZE':
			eTitle += "Bronze " + SoloqStats['rank']
			colorHEX = "#A4855C"
			rankedIconURL = "https://i.imgur.com/xBcS66N.png"
			break;
		case 'SILVER':
			eTitle += "Silver " + SoloqStats['rank']
			colorHEX = "#A0B5BA"
			rankedIconURL = "https://i.imgur.com/XXsF8SZ.png"
			break;
		case 'GOLD':
			eTitle += "Gold " + SoloqStats['rank']
			colorHEX = "#EAB249"
			rankedIconURL = "https://i.imgur.com/bvySBsx.png"
			break;
		case 'PLATINUM':
			eTitle += "Platinum " + SoloqStats['rank']
			colorHEX = "#5ABBCC"
			rankedIconURL = "https://i.imgur.com/jpOdDbY.png"
			break;
		case 'DIAMOND':
			eTitle += "Diamond " + SoloqStats['rank']
			colorHEX = "#7187FF"
			rankedIconURL = "https://i.imgur.com/XSV2xSV.png"
			break;
		case 'MASTER':
			eTitle += "Master"
			colorHEX = "#E971FF"
			rankedIconURL = "https://i.imgur.com/rZbl7e3.png"
			break;
		case 'GRANDMASTER':
			eTitle += "Grandmaster"
			colorHEX = "#FF7171"
			rankedIconURL = "https://imgur.com/LBw0aFo.png"
			break;
		case 'CHALLENGER':
			eTitle += "Challenger"
			colorHEX = "#FFE07B"
			rankedIconURL = "https://imgur.com/RuQsAWD.png"
			break;
		default:
			eTitle += "Error"
			break;
	}

	eTitle += ", " + SoloqStats['leaguePoints'] + " LP"
	embedMessage.setTitle(eTitle);
	embedMessage.setThumbnail(rankedIconURL);
	//let winrateString = (Math.floor(getWinrate(SoloqStats['wins'], SoloqStats['losses']) * 100) + "% WR");
	//eDesc += SoloqStats['wins'] + "W " + SoloqStats['losses'] + "L | " + winrateString
	embedMessage.setDescription(eDesc);
	embedMessage.setFooter("Requested by: " + receivedMessage.author.username); //remopve trhis
	embedMessage.setColor(colorHEX);
	receivedMessage.channel.send(embedMessage);
	receivedMessage.delete();
	

}
//*****************************************************************************************************************************
//RIOT API STUFF
async function getSummonerFromName(summonerName) {
	let getSummonerData = async () => {
		let summonerDataAPI = "https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/" + summonerName + "?api_key=" + riotAPIKey;
		let response = await axios.get(summonerDataAPI);
		let summonerData = response.data
		return summonerData;
	};
	let summoner = await getSummonerData();
	//console.log(summoner)
	return summoner;
}

async function getTFTSummonerFromName(summonerName) {
	let getSummonerData = async () => {
		let summonerDataAPI = "https://na1.api.riotgames.com/tft/summoner/v1/summoners/by-name/" + summonerName + "?api_key=" + riotTFTAPIKey;
		let response = await axios.get(summonerDataAPI);
		let summonerData = response.data
		return summonerData;
	};
	let summoner = await getSummonerData();
	return summoner;
}

async function getSummonerIDFromSummoner(summoner){
	let summonerID = summoner['id']
	return summonerID;
}

async function getSoloQStatsFromSummonerID(summonerID){
	let getSoloqStats = async () => {
		let summonerDataAPI = "https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/" + summonerID + "?api_key=" + riotAPIKey;
		let response = await axios.get(summonerDataAPI);
		let summonerData = response.data
		return summonerData;
	}
	let SoloqStats = await getSoloqStats();

	let SOLOQ = null;
	var i;
	for(i = 0; i < SoloqStats.length; i++){
		if(SoloqStats[i]['queueType'] == 'RANKED_SOLO_5x5'){
			SOLOQ = SoloqStats[i];
		}
	}

	return SOLOQ;
}

async function getTFTQStatsFromSummonerID(summonerID){
	let getTFTqStats = async () => {
		let summonerDataAPI = "https://na1.api.riotgames.com/tft/league/v1/entries/by-summoner/" + summonerID + "?api_key=" + riotTFTAPIKey;
		let response = await axios.get(summonerDataAPI);
		let summonerData = response.data
		return summonerData;
	}
	let TFTqStats = await getTFTqStats();

	let TFTQ = null;
	var i;
	for(i = 0; i < TFTqStats.length; i++){
		if(TFTqStats[i]['queueType'] == 'RANKED_TFT'){
			TFTQ = TFTqStats[i];
		}
	}
	//console.log(TFTQ)
	return TFTQ;
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
	//console.log(matchlist.matches);
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
	let primaryCommand = findCommand(splitCommand[0].toLowerCase()) // The first word directly after the exclamation is the command
	let arguments = splitCommand.slice(1) // All other words are arguments/parameters/options for the command
	let re = new RegExp("^[a-zA-Z0-9]*$")

	if (fullCommand == null || fullCommand.startsWith("!", 0) || !re.test(primaryCommand)) {
		return;
	}
	else {
		console.log("Command Received from User: " + receivedMessage.author.id + " \n --Command: " + primaryCommand + " with Arguments: " + arguments)
		switch (primaryCommand) {
			case "test":
				testCommand(arguments, receivedMessage)
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
			case "soloq":
				soloQStats(arguments, receivedMessage)
				break;
			case "tftq":
				tftQStats(arguments, receivedMessage)
				break;
			case "champ":
				champggCommand(arguments, receivedMessage)
				break;
			case "meme":
				memeifyChatCommand(arguments, receivedMessage)
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
			case "roll":
				rollCommand(arguments, receivedMessage)
				break;
			case "coin":
				coinflipCommand(arguments, receivedMessage)
				break;
			case "":
				break;
			default:
				receivedMessage.channel.send("no command found");
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

async function soloQStats(arguments,  receivedMessage){
	let SoloqStats = await getSoloQStatsFromSummonerID(await getSummonerIDFromSummoner(await getSummonerFromName([arguments.join('')])));
	if(SoloqStats == null){
		receivedMessage.channel.send("Summoner Not Found");
	}

	const embedMessage = new Discord.MessageEmbed()
		.setAuthor(SoloqStats['summonerName'])													
	
	let rankedIconURL = "https://i.imgur.com/XXsF8SZ.png" // default silver
	let colorHEX = "#A0B5BA" // default silver
	let eTitle = ""
	let eDesc = ""
	switch(SoloqStats['tier']){
		case 'IRON':
			eTitle += "Iron " + SoloqStats['rank']
			colorHEX = "#4F4F4F"
			rankedIconURL = "https://i.imgur.com/93pc8Ws.png"
			break;
		case 'BRONZE':
			eTitle += "Bronze " + SoloqStats['rank']
			colorHEX = "#A4855C"
			rankedIconURL = "https://i.imgur.com/xBcS66N.png"
			break;
		case 'SILVER':
			eTitle += "Silver " + SoloqStats['rank']
			colorHEX = "#A0B5BA"
			rankedIconURL = "https://i.imgur.com/XXsF8SZ.png"
			break;
		case 'GOLD':
			eTitle += "Gold " + SoloqStats['rank']
			colorHEX = "#EAB249"
			rankedIconURL = "https://i.imgur.com/bvySBsx.png"
			break;
		case 'PLATINUM':
			eTitle += "Platinum " + SoloqStats['rank']
			colorHEX = "#5ABBCC"
			rankedIconURL = "https://i.imgur.com/jpOdDbY.png"
			break;
		case 'DIAMOND':
			eTitle += "Diamond " + SoloqStats['rank']
			colorHEX = "#7187FF"
			rankedIconURL = "https://i.imgur.com/XSV2xSV.png"
			break;
		case 'MASTER':
			eTitle += "Master"
			colorHEX = "#E971FF"
			rankedIconURL = "https://i.imgur.com/rZbl7e3.png"
			break;
		case 'GRANDMASTER':
			eTitle += "Grandmaster"
			colorHEX = "#FF7171"
			rankedIconURL = "https://imgur.com/LBw0aFo.png"
			break;
		case 'CHALLENGER':
			eTitle += "Challenger"
			colorHEX = "#FFE07B"
			rankedIconURL = "https://imgur.com/RuQsAWD.png"
			break;
		default:
			eTitle += "Error"
			break;
	}

	eTitle += ", " + SoloqStats['leaguePoints'] + " LP"
	embedMessage.setTitle(eTitle);
	embedMessage.setThumbnail(rankedIconURL);
	let winrateString = (Math.floor(getWinrate(SoloqStats['wins'], SoloqStats['losses']) * 100) + "% WR");
	eDesc += SoloqStats['wins'] + "W " + SoloqStats['losses'] + "L | " + winrateString
	embedMessage.setDescription(eDesc);
	embedMessage.setFooter("Ranked Solo/Duo");
	embedMessage.setColor(colorHEX);
	receivedMessage.channel.send(embedMessage);
	receivedMessage.delete();
}

async function tftQStats(arguments, receivedMessage){
	let SoloqStats = await getTFTQStatsFromSummonerID(await getSummonerIDFromSummoner(await getTFTSummonerFromName([arguments.join('')])));
	//console.log(SoloqStats)
	if(SoloqStats == null){
		receivedMessage.channel.send("Summoner Not Found");
	}

	const embedMessage = new Discord.MessageEmbed()
		.setAuthor(SoloqStats['summonerName'])													
	
	let rankedIconURL = "https://i.imgur.com/XXsF8SZ.png" // default silver
	let colorHEX = "#A0B5BA" // default silver
	let eTitle = ""
	let eDesc = ""
	switch(SoloqStats['tier']){
		case 'IRON':
			eTitle += "Iron " + SoloqStats['rank']
			colorHEX = "#4F4F4F"
			rankedIconURL = "https://i.imgur.com/93pc8Ws.png"
			break;
		case 'BRONZE':
			eTitle += "Bronze " + SoloqStats['rank']
			colorHEX = "#A4855C"
			rankedIconURL = "https://i.imgur.com/xBcS66N.png"
			break;
		case 'SILVER':
			eTitle += "Silver " + SoloqStats['rank']
			colorHEX = "#A0B5BA"
			rankedIconURL = "https://i.imgur.com/XXsF8SZ.png"
			break;
		case 'GOLD':
			eTitle += "Gold " + SoloqStats['rank']
			colorHEX = "#EAB249"
			rankedIconURL = "https://i.imgur.com/bvySBsx.png"
			break;
		case 'PLATINUM':
			eTitle += "Platinum " + SoloqStats['rank']
			colorHEX = "#5ABBCC"
			rankedIconURL = "https://i.imgur.com/jpOdDbY.png"
			break;
		case 'DIAMOND':
			eTitle += "Diamond " + SoloqStats['rank']
			colorHEX = "#7187FF"
			rankedIconURL = "https://i.imgur.com/XSV2xSV.png"
			break;
		case 'MASTER':
			eTitle += "Master"
			colorHEX = "#E971FF"
			rankedIconURL = "https://i.imgur.com/rZbl7e3.png"
			break;
		case 'GRANDMASTER':
			eTitle += "Grandmaster"
			colorHEX = "#FF7171"
			rankedIconURL = "https://imgur.com/LBw0aFo.png"
			break;
		case 'CHALLENGER':
			eTitle += "Challenger"
			colorHEX = "#FFE07B"
			rankedIconURL = "https://imgur.com/RuQsAWD.png"
			break;
		default:
			eTitle += "Error"
			break;
	}

	eTitle += ", " + SoloqStats['leaguePoints'] + " LP"
	embedMessage.setTitle(eTitle);
	embedMessage.setThumbnail(rankedIconURL);
	let winrateString = (Math.floor(getWinrate(SoloqStats['wins'], SoloqStats['losses']) * 100) + "% WR");
	eDesc += "Winrate | " + winrateString + "\n"
	eDesc += SoloqStats['wins'] + "W " + SoloqStats['losses'] + "L\n"
	embedMessage.setDescription(eDesc);
	embedMessage.setFooter("Ranked TFT");
	embedMessage.setColor(colorHEX);
	receivedMessage.channel.send(embedMessage);
	receivedMessage.delete();
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
	receivedMessage.delete();
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