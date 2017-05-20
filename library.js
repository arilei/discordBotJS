module.exports = { //MANERA 1
  saludos : saludosMethod
 ,getParamsAsList : getParamsAsList
 ,newChannel : newChannel
};

function saludosMethod(){
    return "Hola wachem ";
  }

function getParamsAsList(mensaje){
  var params = mensaje.substring(mensaje.indexOf('(')+1,mensaje.indexOf(')'))
  return params.split(',')
}

function newChannel(params,channel){
  if(params.length == 2){
    if(params[1] == "text" ||params[1] == "voice"){
      channel.guild.createChannel(params[0], params[1]);
      return;
    }
  }
  channel.send("Command Error");
  return;
}




/*
module.exports = {   // MANERA 2
  saludos : function(){
    return "Hola wachem";
  }
}*/