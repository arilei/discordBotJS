module.exports = {
 getParamsAsList : getParamsAsList
 ,isAdmin : isAdmin
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
