module.exports = { //MANERA 1
  saludos : saludosMethod
 ,getParamsAsList : getParamsAsList
 ,newChannel : newChannel
 ,seConecto : seConecto
 ,seDesconecto : seDesconecto
 ,toggleNotif : toggleNotif
 ,newGame : newGame
 ,finishGame : finishGame
 ,isAdmin : isAdmin
 ,startGame : startGame
};

function randomStartQuote(){
  var gameStartQuotes = ["Que la suerte este siempre de su lado.","Que gane el mejor!","Geimu, HAJIMARU","Gentlemen, start your engines"]
  return gameStartQuotes[Math.floor(Math.random() * gameStartQuotes.length)];
}

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
      return mensaje.guild.createChannel(params[0], params[1])
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
        storageValue.botChannelList = aux;
        storage.setItemSync(mensaje.guild.id,storageValue);
        return newChannel.id;
      });
    }
  }
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
  miembro.voiceChannel.guild.defaultChannel.send("@here. Se conecto "+ miembro + " al canal " + miembro.voiceChannel,{tts:true} )
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

function finishGame(message,storage){
  var storageValue = storage.getItemSync(message.guild.id);
  if(storageValue == undefined)
    storageValue = {};
  var storageGameData = storageValue.gameData
  if(storageGameData == undefined)
    storageGameData = {};

  if(storageGameData == {}){
    message.channel.send("No hay un juego en progreso!");
    return;
  }
  if((storageGameData.owner != message.author.id) && (!isAdmin(message.author.tag,message))){
    message.channel.send("No tienes permisos para terminar el juego");
    return;
  }

  //
  // TODO : AGREGAR MOVER A TODOS LOS USER DE LOS CANALES AL DEFAULT DE VOZ
  //

  console.log("---------------------------------------");
  console.log("Borrando channels");
  var channelList = storageGameData.channelList;
  for(var channelId of channelList){
    message.guild.channels.get(channelId).delete().then(()=>{console.log("Canal " + channelId + " borrado correctamente")});
  }

  console.log("---------------------------------------");
  console.log("Borrando roles");
  var roleList = storageGameData.roleList;
  for(var roleId of roleList){
    message.guild.roles.get(roleId).delete().then(()=>{console.log("Rol " + roleId + " borrado correctamente")});
  }


  storageValue.gameData = undefined;
  storage.setItemSync(message.guild.id,storageValue)

  message.channel.send("Juego terminado");
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
  storageGameData.status = 'initializing';
  storageGameData.teamsAmmount = params[0];
  storageGameData.channelNames = params[1];
  storageGameData.owner = message.member.id;
  storageGameData.channelList = [];
  storageGameData.roleList = [];
  storageGameData.memberList = [];
  Promise.all([initializeChannels(params[0],params[1],message,storage)
              ,initializeRoles(params[0],params[1],message)
             ]) // Agregar otras promises para roles, miembros, etc para hacer multithreading. GG YO
  .then(response =>{
    storageGameData.channelList = response[0];
    storageGameData.roleList = response[1];
    storageValue.gameData = storageGameData;
    storage.setItemSync(message.guild.id,storageValue);
    message.channel.send("Juego creado correctamente!");
  })
  .catch(error=>{
    message.channel.send("Error al crear el juego");
    console.log(error)
  }); // params[0] = cantidad de equipos ; params[1] = nombre de canales ; params[>=2] = jugadores
  // Falta agregar jugadores a los canales
}

function startGame(message,storage){
  var storageValue = storage.getItemSync(message.guild.id);
  if(storageValue == undefined)
    storageValue = {};
  var storageGameData = storageValue.gameData;
  if(storageGameData == undefined){
    storageGameData = {}
    storageGameData.inProgress = false;
  }
  if((storageGameData.owner != message.author.id) && (!isAdmin(message.author.tag,message))){
    message.channel.send("No tienes permisos para ejecutar este comando");
    return;
  }
  if(storageGameData.inProgress == false || storageGameData.status == 'running'){
    message.channel.send("No hay un juego en progreso o ya ha empezado!");
    return;
  }
  console.log("-------------------------------")
  console.log("Starting game...")
  for(var channelId of storageGameData.channelList){
    var channel = message.guild.channels.get(channelId)
    message.channel.send("Equipo " + channel.name +":");
    channel.overwritePermissions(channel.guild.defaultRole,{CONNECT:false})
    for(var member of channel.members){
      message.channel.send(member[1].toString());
      channel.overwritePermissions(member[1].user,{CONNECT:true})
    }
  }

  storageValue.gameData.status = "running";
  storage.setItemSync(message.guild.id,storageValue);
  message.channel.send("El juego ha comenzado correctamente");
  message.channel.send(randomStartQuote());
  console.log("Game started")
}


function initializeChannels(teamsAmmount,teamNames,message,storage){
  return new Promise((resolve,reject) => {
     if(teamsAmmount <1){
      message.channel.send("La cantidad de equipos no puede ser menos que 1");
      reject();
      return;
    }
    console.log("____________________________________________");
    console.log("Creando "+ teamsAmmount + " canales...");
    var promiseList = [];
    for(var i=1;i<=teamsAmmount;i++){
      promiseList.push(newChannel([teamNames+" "+i,"voice"],message,storage));
    }
    Promise.all(promiseList).then(values=>{
      console.log(teamsAmmount + " canales creados correctamente");
      console.log("____________________________________________");
      resolve(values);
    })
  })
}

function initializeRoles(teamsAmmount,teamNames,message){
  return new Promise((resolve,reject) => {
    var roleArray = [];
    var promiseList = []
    for(var i=1;i<=teamsAmmount;i++){
      promiseList.push(message.guild.createRole({name : teamNames+i + " role"}))
    }
    Promise.all(promiseList)
    .then(values =>{
      console.log(teamsAmmount + " roles creados correctamente");
      console.log("____________________________________________");
      for(var i=0;i<teamsAmmount;i++){
        roleArray.push(values[i].id);
      }
      resolve(roleArray);
    })
    .catch(error =>{
      reject(error);
    })
  })
}



function isAdmin(memberTag,message){
  if(memberTag == "Roklo!#0591" || memberTag == "taric#3591" || memberTag == "Zephi!!#0180")
    return true;
  else{
    message.channel.send("No tienes permisos para ejecutar este comando");
    return false;
  }
}
