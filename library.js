module.exports = {
 getParamsAsList : getParamsAsList
 ,isAdmin : isAdmin
 ,help : help
};

function randomStartQuote(){
  var gameStartQuotes = ["Que la suerte este siempre de su lado.","Que gane el mejor!","Geimu, HAJIMARU","Gentlemen, start your engines"]
  return gameStartQuotes[Math.floor(Math.random() * gameStartQuotes.length)];
}

function getParamsAsList(mensaje){
  var params = mensaje.substring(mensaje.indexOf('(')+1,mensaje.indexOf(')'))
  return params.split(',')
}


function isAdmin(memberTag,message){
  if(memberTag == "Roklo!#0591" || memberTag == "taric#3591" || memberTag == "Zephi!!#0180")
    return true;
  else{
    message.channel.send("No tienes permisos para ejecutar este comando");
    return false;
  }
}

function help(){
  return  `# Nyan Bot

Prefix: nyan! ; Example: nyan!toggleNotif


Commands:

* toggleNotif : Enables/Disables notifications about an user entering a voice channel.

* newGame({Ammount of teams},{Team Names}) : Creates a new game and creates the channels that are necessary, waiting for the next commands.

* startGame : Starts the game with the players and teams that are in each channel. Players in the random channel will be auto-assigned.

* finishGame : Cancels or stops the game if already started, deleting all channels created.


Enjoy!`;
}
