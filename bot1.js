/**
 * 
 */
const Discord = require('discord.js')
const client = new Discord.Client();
const axios = require('axios');
const Datastore = require('nedb');

//var lastSentMsg;
//List of Commands Avalible
const helpCommands = ["help"];
const opggCommands = ["opgg","op.gg"];
const allOpggCommands = ["aopgg", "a.op.gg"];
const championCommands = ["champ", "ch"];
const memeifyCommands = ["meme", "me"];
const caesarRodneyCommands = ["cr", "caesar", "cesar"];
const pencaderCommands = ["pencader", "pen"];
const pogPlantImageCommands = ["pogplant", "pp"];
const magic8BallCommands = ["8", "magic", "8ball", "magic8ball", "m8"];
const dogCommands = ["dog"];
const catCommands = ["cat"];
const registerCommands = ["register"];
const pCommands = ["pogcoins", "p"];
const emptyCommands = [""];

const allCommands = [helpCommands, opggCommands, allOpggCommands, championCommands, memeifyCommands, caesarRodneyCommands, pencaderCommands,
					 pogPlantImageCommands, magic8BallCommands, dogCommands, catCommands, registerCommands, pCommands, emptyCommands];

			
const database = new Datastore('datastore.db');
database.loadDatabase();	 
const dbCompactInterval = 60000; //number in miliseconds
//*****************************************************************************************************************************
client.on('ready', ()=> {
	client.user.setActivity("with your mom lol")
	listAllConnectedServersAndChannels()
	console.log("DiscordBot Started")
	console.log("Setting Automatic Database Persistence to " + dbCompactInterval + " ms")
	database.persistence.setAutocompactionInterval(dbCompactInterval)
})

client.on('message', (receivedMessage) =>{
	console.log("received message");
	if(receivedMessage.author == client.user){
		console.log("Message from self")
		return
	}
	/*
	if(checkIfExclamationPointExpression(receivedMessage) || checkIfSingleExclamationPoint(receivedMessage)){
		console.log("checking exclamation points")
		return
	}
	*/
	else if(receivedMessage.content.startsWith("!")) { //!command
        processCommand(receivedMessage)
    }
	if(receivedMessage.content.includes(client.user.toString())) { //if tagged
		
	}
})

function listAllConnectedServersAndChannels(){
	console.log("Servers:")
    client.guilds.forEach((guild) => {
        console.log(" - " + guild.name)
        guild.channels.forEach((channel) => {
            console.log(` -- ${channel.name} (${channel.type}) - ${channel.id}`)
        })
    })
}

//this doesnt work
function checkIfSingleExclamationPoint(receivedMessage){
	let fullCommand = receivedMessage.content;
	let splitCommand = fullCommand.split(" ");
	let primaryCommand = findCommand(splitCommand[0]);
	if(primaryCommand === ""){
		return true
	}
	else{
		return false
	}
}

function checkIfExclamationPointExpression(receivedMessage){
	let fullCommand = receivedMessage.content;
	var numOfExclamationPoints = 0;
	var numOfSpaces = 0;
	var numOfOtherCharacters
	for(var i = 0; i < fullCommand.length; i++){
		if(fullCommand.charAt(i) == '!'){
			numOfExclamationPoints += 1
		}
		if(fullCommand.charAt(i) == ' '){
			numOfSpaces += 1
		}
		else{
			numOfOtherCharacters += 1
		}
	}
	if(numOfExclamationPoints >= 2 ){
		return true
	}
	else{
		return false
	}
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

function isInDB(arguments, receivedMessage){
	console.log("Checking if " + receivedMessage.author.id + " is in Database...")
	database.findOne({discordID: receivedMessage.author.id}, (err,data) =>{
		if(data == null){
			console.log('--can not find user: ' + receivedMessage.author.id +', adding new entry')
			database.insert({discordID: receivedMessage.author.id, pogcoins: 0});
		}
		else{
			console.log('--found User: '+ data.discordID);
		}
	})
	return true;
}

function getUserCoins(authorID){
	console.log("getting user: " + authorID)
	//if(isInDB(arguments, receivedMessage)){
	var pogC =
	database.findOne({discordID: authorID}, function (err,data) {
			if(data != null){
				pogC =  data.pogcoins;
				//console.log(data.pogcoins);
				return data.pogcoins;
			}
		});
	return pogC;
}

function testCommand(arguments, receivedMessage){
	receivedMessage.channel.send("Test Command Executed!");
	receivedMessage.channel.send("TEST COMMAND SENDER ID: " + receivedMessage.author.id);
	//console.log(getUserCoins(receivedMessage.author.id));
	//giveUserPogcoins("125805688797659138","200297996213157888", 1 , receivedMessage);
	//console.log(receivedMessage.mentions);
	//console.log(getUserFromMention(arguments[0]).id);
	database.insert({discordID: "566351215282356224", pogcoins: 0});


}
//*****************************************************************************************************************************

function checkMultipleExclamationPoints(primaryCommand){
	
}

//*****************************************************************************************************************************
function processCommand(receivedMessage) {
	let fullCommand = receivedMessage.content.substr(1) // Remove the leading exclamation mark
	//let fullCommand = receivedMessage.content.slice(1);
	//let splitCommand = fullCommand.split(" ") // Split the message up in to pieces for each space
	let splitCommand = fullCommand.split(/ +/) // Split the message up in to pieces for each space
    //*******************************************************************************************
    let primaryCommand = findCommand(splitCommand[0].toLowerCase()) // The first word directly after the exclamation is the command
	let arguments = splitCommand.slice(1) // All other words are arguments/parameters/options for the command
	//console.log(arguments)
	console.log(primaryCommand)
	console.log(fullCommand)
	if(fullCommand == null || fullCommand.startsWith("!", 0)){
		return;
	}
	if(splitCommand[0].toLowerCase() == "test"){
    	testCommand(arguments, receivedMessage)
	}
    else{
    switch(primaryCommand){
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
    case "tsquare":
    	tianSquareCommand(arguments, receivedMessage)
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
    case "8":
    	magic8BallCommand(arguments, receivedMessage)
    	break;
	case "dog":
		dogCommand(arguments, receivedMessage)
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
    case "":
    	break;
	}
	
    }
}

function findCommand(primaryCommand){
	
	for(var listNum = 0; listNum < allCommands.length; listNum++){
	//List of Commands
		for(var commandNum = 0; commandNum < allCommands[listNum].length; commandNum++){
		//Command in List
			if(primaryCommand == allCommands[listNum][commandNum]){
				return allCommands[listNum][0]
			}
		}
	}
	return "Invalid_Command"
}

function givePogcoins(arguments, receivedMessage){
	let amount = parseInt(arguments[1]);
	let userID1 = receivedMessage.author.id;
	let userID2 = receivedMessage.mentions.users.first().id.toString();
	giveUserPogcoins(userID1, userID2, amount, receivedMessage);
}

function giveUserPogcoins(user1, user2, amount, receivedMessage){
	
	if(amount <= 0){
		receivedMessage.channel.send("Invalid Amount");
		return;
	}
	if(user1 == user2){
		receivedMessage.channel.send("cant give to yourself");
		return;
	}
	database.findOne({discordID: user1}, function (err,data) {
		if(data != null){
			if(amount > data.pogcoins){
				receivedMessage.channel.send("Insufficient pogcoins to give");
				return;
			}
			else{
				console.log("User: " + user1 + " giving User: " + user2 + " " + amount + " pogcoins");
				changePogCoin(user2, amount);
				changePogCoin(user1, -amount);
				receivedMessage.channel.send("Sent pogcoins")
			}
		}
	});
}

function changePogCoin(authorID, amount){
	database.findOne({discordID: authorID}, (err,data) =>{
		if(data != null){
			database.update({discordID: authorID}, {$inc: { pogcoins: amount}}, {multi: true}, function(err, numReplaced){console.log("Changed User: " + authorID + " pogcoins by " + amount)});
		}
		else{
			receivedMessage.channel.send("Could not find user, Try typing !register");
		}
	})
}

//pogCoins POGGERS
function pogCoinCommand(arguments, receivedMessage){
	console.log("pogcoin command from user: " + receivedMessage.author.id);
	switch(arguments[0]){
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


function addOnePogCoin(arguments, receivedMessage){
	var aID;
	if(arguments.length > 2){
		var aID = arguments[2];
	}
	else{
		var aID = receivedMessage.author.id;
	}
	changePogCoin(aID, parseInt(arguments[1]))
}



function checkCoins(arguments, receivedMessage){
	if(arguments.length > 1){
		checkUserCoins(receivedMessage.mentions.users.first(), receivedMessage);
		return;
	}
	database.findOne({discordID: receivedMessage.author.id}, (err,data) =>{
		if(data != null){
			receivedMessage.channel.send("You have: " + data.pogcoins + " pogcoins!")
		}
		else{
			receivedMessage.channel.send("User not found, try typing !register");
		}
	})
}

function checkUserCoins(author, receivedMessage){
	database.findOne({discordID: author.id.toString()}, (err,data) =>{
		if(data != null){
			receivedMessage.channel.send("User: "+ author.username + " has " + data.pogcoins + " pogcoins!")
		}
		else{
			receivedMessage.channel.send("User "+ author.username + " not found ");
		}
	})
}

//command functions
function invalidCommand(arguments, receivedMessage){
	receivedMessage.channel.send("Invalid Command, try typing \"!help\" for the list of commands")
}

function helpCommand(arguments, receivedMessage){
	var returnMsg = "```";
	allCommands.forEach((commandList) =>{
		if (commandList[0] != ""){
			returnMsg += "!" + commandList[0] + ", "
		}	
	})
	returnMsg = returnMsg.substring(0, returnMsg.length - 2)
	returnMsg += "```"
	receivedMessage.author.send(returnMsg)
}

function opggCommand(arguments, receivedMessage){
	if(arguments.length > 1){
		var msg = "https://na.op.gg/multi/query=";
		arguments.forEach((value) =>{
			if(value == "brad"){
				msg = msg + "braddddddd" + "%2C"
			}
			else{
				msg = msg + value + "%2C"
			}
		})
		msg = msg.substring(0, msg.length - 3)
		receivedMessage.channel.send(msg)
	}
	else{
		if(arguments[0] == "brad"){
			receivedMessage.channel.send("https://na.op.gg/summoner/userName=braddddddd")
		}
		else{
			receivedMessage.channel.send("https://na.op.gg/summoner/userName=" + arguments[0])
		}
	}
}

function allOpggCommand(arguments, receivedMessage){
	var name = arguments[0]
	if(name == "Herson" || name == "Joe" || name == "Joseph" || name == "joe" || name == "herson" || name == "joseph"){
		receivedMessage.channel.send("https://na.op.gg/multi/query=herson%2Cscaredypoop")
	}
	else if(name == "flexq"){
		receivedMessage.channel.send("https://na.op.gg/multi/query=lifeingrey%2Cnightstealth%2CSixer%2Cbloxipus%2Cmire")
	}
	else if(name == "mic" || name == "mike" || name == "Mic" || name == "midget" || name == "Mike"){
		receivedMessage.channel.send("https://na.op.gg/multi/query=eastcoastcarry%2Cicansavethem%2Ctokyotraphouse%2Cdemonsxd")
	}
	else{
		receivedMessage.channel.send("Invalid Input")
	}
}

function champggCommand(arguments, receivedMessage){
	var championName = arguments[0];
	var role = arguments[1];
	if(arguments.length == 1){
		receivedMessage.channel.send("https://na.op.gg/champion/" + championName + "/statistics")
	}
	else if(role == "top"){
			receivedMessage.channel.send("https://na.op.gg/champion/" + championName + "/statistics/top")
		}
		else if(role == "jg" || role == "jungle" || role == "jung"){
			receivedMessage.channel.send("https://na.op.gg/champion/" + championName + "/statistics/jungle")
		}
		else if(role == "mid" || role == "middle"){
			receivedMessage.channel.send("https://na.op.gg/champion/" + championName + "/statistics/mid")
		}
		else if(role == "adc" || role == "ad" || role == "bot" || role == "bottom"){
			receivedMessage.channel.send("https://na.op.gg/champion/" + championName + "/statistics/bot")
		}
		else if(role == "supp" || role == "sup" || role == "support"){
			receivedMessage.channel.send("https://na.op.gg/champion/" + championName + "/statistics/support")
		}
		else{
			receivedMessage.channel.send("Incorrect Input: !champ [champion name] [position/role]")
		}
}

function memeifyChatCommand(arguments, receivedMessage){
	var msg = "";
	arguments.forEach((value) =>{
		msg = msg + value + " "
	})
	msg = msg.substring(0, msg.length - 1)
	var i;
	var returnMsg = "";
	for(i = 0; i < msg.length; i++){
		if(msg.charAt(i) != " "){
			if(Math.floor(Math.random() * 2) == 0){
				returnMsg = returnMsg + msg.charAt(i).toLowerCase();
			}
			else{
				returnMsg = returnMsg + msg.charAt(i).toUpperCase();
			}
				
		}
		else{
			returnMsg = returnMsg + " ";
		}
	}
	returnMsg = returnMsg.substring(0, returnMsg.length)
	receivedMessage.channel.send(returnMsg);
}

function caeserRodneyCommand(arguments, receivedMessage){
	receivedMessage.channel.send("https://udel.campusdish.com/LocationsAndMenus/CaesarRodneyFreshFoodCompany")
}

function pencaderCommand(arguments, receivedMessage){
	receivedMessage.channel.send("https://udel.campusdish.com/LocationsAndMenus/PencaderResidentialDining")
}
function pogPlantImageCommand(arguments, receivedMessage){
	receivedMessage.channel.send(new Discord.Attachment('\images\\pogplant.jpg'))
}

async function dogCommand(arguments, receivedMessage){
	let getDog = async () => {
		let dogAPI = 'https://dog.ceo/api/breed/hound/images/random';
		if(arguments.length == 1){
			dogAPI = 'https://dog.ceo/api/breed/' + arguments[0] + '/images/random'
		}
		else{
			dogAPI = 'https://dog.ceo/api/breeds/image/random'
		}
		let response = await axios.get(dogAPI);
		let dogData = response.data
		return dogData;
	};
	let dogImg = await getDog();
	receivedMessage.channel.send(dogImg.message);
	
}

async function catCommand(arguments, receivedMessage){
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
function magic8BallCommand(arguments, receivedMessage){
	const m8ballCommand = Math.floor(Math.random() * 20);
	const m8ballColor = (m8ballCommand % 4);
	const m8ballAnswers = ["It is certain.", "As I see it, yes.", "Reply hazy, try again.", "Don't count on it.",
						   "It is decidedly so.", "Most likely.", "Ask again later.", "My reply is no.",
						   "Without a doubt.", "Outlook good.", "Better not tell you now.", "My sources say no.",
						   "Yes - definitely.", "Yes.", "Cannot predict now.", "Outlook not so good.",
						   "You may rely on it.", "Signs point to yes.", "Concentrate and ask again.", "Very doubtful."];
	
	let m8ballC = 0x000000;
	switch(m8ballColor){
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
	
	receivedMessage.channel.send({embed});
}
client.login("")