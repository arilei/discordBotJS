module.exports = { //MANERA 1
  saludos : saludosMethod
 ,getParamsAsList : getParamsAsList
 ,newChannel : newChannel
 ,seConecto : seConecto
 ,seDesconecto : seDesconecto
 ,toggleNotif : toggleNotif
 ,newGame : newGame
};


function saludosMethod(){
    return "Hola wachem ";
  }

function getParamsAsList(mensaje){
  var params = mensaje.substring(mensaje.indexOf('(')+1,mensaje.indexOf(')'))
  return params.split(',')
}

function newChannel(params,mensaje,storage){
  if(params.length == 2){
    if(params[1] == "text" ||params[1] == "voice"){
      mensaje.guild.createChannel(params[0], params[1])
      .then(newChannel =>{
        var aux = {};
        var auxuc = [];
        var storageValue = storage.getItemSync(mensaje.guild.id);
        if(!(storageValue == undefined)){
          if(storageValue.botChannelList != undefined){
            aux = storageValue.botChannelList;
            if (!(aux[mensaje.author.id]==undefined)){
              auxuc=aux[mensaje.author.id];
              var strauxuc =aux[mensaje.author.id];
            }
          }
        }else{
          storageValue = {}
        }

        auxuc.push(newChannel.id);
        aux[mensaje.author.id]=(auxuc);
        console.log(aux);
        storageValue.botChannelList = aux;
        storage.setItemSync(mensaje.guild.id,storageValue);
      });
      return;
    }
  }
  mensaje.channel.send("Command Error");
  return;
}

function deleteChannel(){

}

function seConecto(miembro,pila){
  aux={};

  if (pila[miembro.voiceChannel.guild.id]!=null){
    aux=pila[miembro.voiceChannel.guild.id];
    if (aux[miembro.id]!=null){
      if (new Date(new Date().getTime()+5*(-60000))<new Date(aux[miembro.id])){

        return;
      }
    }
  }
  miembro.voiceChannel.guild.defaultChannel.send("@here. Se conecto "+ miembro + " al canal " + miembro.voiceChannel )
}

function seDesconecto(miembro,pila){
  aux={};
  if (pila[miembro.voiceChannel.guild.id]!=null){
    aux=pila[miembro.voiceChannel.guild.id];
    if (aux[miembro.id]!=null){
      delete aux[miembro.id];
    }
    delete pila[miembro.voiceChannel.guild.id];
  }
  aux[miembro.id]=new Date().getTime();
  pila[miembro.voiceChannel.guild.id]=aux;
  return pila;
}

function toggleNotif(message, storage){
  var storageValue = storage.getItemSync(message.guild.id);
  if(storageValue == undefined)
    storageValue = {};
  var aux = storageValue.notificationsEnabled;
  if(aux == undefined){ // Default = habilitadas (true) entonces cambiar a false al estar vacio
    aux = false;
    message.channel.send("Notificaciones deshabilitadas");
  }else if(!aux){
    aux = true;
    message.channel.send("Notificaciones habilitadas");
  }else{
    aux = false
    message.channel.send("Notificaciones deshabilitadas");
  }
  storageValue.notificationsEnabled = aux
  storage.setItemSync(message.guild.id,storageValue);
}


function newGame(params,message,storage){
  if(params.length <2){
    message.channel.send("Comando inválido");
    return;
  }

  var storageValue = storage.getItemSync(message.guild.id);
  if(storageValue == undefined)
    storageValue = {};
  var storageGameData = storageValue.gameData;
  if(storageGameData == undefined){
    storageGameData = {}
    storageGameData.inProgress = false;
  }
  if(storageGameData.inProgress == true){
    message.channel.send("Ya hay un juego en progreso!");
    return;
  }

  storageGameData.inProgress = true;
  storageGameData.teamsAmmount = params[0];
  storageGameData.channelNames = params[1];
  storageGameData.owner = message.member.id;
  storageGameData.channelList = [];
  storageGameData.roleList = [];
  storageGameData.memberList = [];

  initializeChannels(params[0],params[1],message,storage); // params[0] = cantidad de equipos ; params[1] = nombre de canales ; params[>=2] = jugadores
  // Falta agregar jugadores a los canales
  storageValue.gameData = storageGameData;
  console.log("storageValue -------------------------");
  console.log(storageValue);
  storage.setItemSync(message.guild.id,storageValue);
}



function initializeChannels(teamsAmmount,teamNames,message,storage){
  if(teamsAmmount <1){
    message.channel.send("La cantidad de equipos no puede ser menos que 1");
    return;
  }
  console.log("____________________________________________");
  console.log("Creando "+ teamsAmmount + " canales...");
  for(var i=1;i<=teamsAmmount;i++){
    newChannel([teamNames+" "+i,"voice"],message,storage);
    console.log("----Canal "+ i+ " creado correctamente");
  }
  console.log(teamsAmmount + " canales creados correctamente");
  console.log("____________________________________________");
}