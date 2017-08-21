module.exports = { 
	newChannel : newChannel
   ,newGame : newGame
   ,finishGame : finishGame
   ,startGame : startGame
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

function newGame(params,message,storage){
  if(params.length <2){
    message.channel.send("Comando inválido");
    return;
  }
  if(params[0]<1){
    message.channel.send("La cantidad de equipos no puede ser menos que 1");
    return;
  }

  if(params[0]>6){
    message.channel.send("Error: Máximo de equipos en 6");
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
  storageGameData.randomTeamChannel = undefined;
  Promise.all([initializeChannels(params[0],params[1],message,storage)
              ,initializeRoles(params[0],params[1],message)
              ,message.guild.createChannel("Equipo Aleatorio","voice")
             ]) // Agregar otras promises para roles, miembros, etc para hacer multithreading. GG YO
  .then(response =>{
    storageGameData.channelList = response[0];
    storageGameData.roleList = response[1];
    storageGameData.randomTeamChannel = response[2].id
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

function finishGame(message,storage){
  var storageValue = storage.getItemSync(message.guild.id);
  if(storageValue == undefined){
    message.channel.send("No hay un juego en progreso!");
    return;
  }
  var storageGameData = storageValue.gameData
  if(storageGameData == undefined){
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

  if(storageGameData.randomTeamChannel != undefined){
    message.guild.channels.get(storageGameData.randomTeamChannel).delete().then(() => { console.log("Canal de team aleatorio borrado")})
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

  var teamPlayersCount = [];
  teamPlayersCount.length = storageGameData.teamsAmmount;


  var i = 0;
  for(channelId of storageGameData.channelList){
    var channel = message.guild.channels.get(channelId)
    teamPlayersCount[i] = { id : channelId, count : 0}
    for(member of channel.members){
      teamPlayersCount[i].count++;
    }
    i++;
  }

  if(storageValue.gameData.randomTeamChannel != undefined){
    var randomChannelObj = message.guild.channels.get(storageValue.gameData.randomTeamChannel);
    autoAssignMembers(randomChannelObj,message,teamPlayersCount).then(()=>{
      for(var channelId of storageGameData.channelList){
        var channel = message.guild.channels.get(channelId)
        message.channel.send("Equipo " + channel.name +":");
        channel.overwritePermissions(channel.guild.defaultRole,{CONNECT:false})
        for(var member of channel.members){
          message.channel.send(member[1].toString());
          channel.overwritePermissions(member[1].user,{CONNECT:true})
        }
      }
     
      storageValue.gameData.randomTeamChannel = undefined;
      storageValue.gameData.status = "running";
      storage.setItemSync(message.guild.id,storageValue);
      message.channel.send("El juego ha comenzado correctamente");
      message.channel.send(randomStartQuote());
      console.log("Game started")
    });
  }
}




// AUXILIARY FUNCTIONS



function initializeChannels(teamsAmmount,teamNames,message,storage){
  return new Promise((resolve,reject) => {
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


function autoAssignMembers(randomTeamObj,message,teamPlayersCount){
  return new Promise((resolve,reject) =>{
    var members = shuffleArray(randomTeamObj.members);
    var promiseArray = [];
    console.log("-----------------------")
    console.log("Corriendo auto-assign...")
    for(member of members){
      var teamPlayersCountElem = leastMembersChannel(teamPlayersCount);
      var minChannel = message.guild.channels.get(teamPlayersCountElem.id);
      teamPlayersCount[teamPlayersCount.indexOf(teamPlayersCountElem)].count++;
      message.channel.send(member[1] + " es asignado al equipo " + minChannel);

      promiseArray.push(member[1].setVoiceChannel(minChannel).then(()=>{console.log("Usuario asignado")}));
    }
    Promise.all(promiseArray).then(() => {
      console.log("Auto-assign terminado.")
      randomTeamObj.delete().then(() => {
        console.log("Canal de team aleatorio borrado");
        resolve();
      }).catch(error=>{reject(error);});
    }).catch(error=>{reject(error)});
  })
}

function leastMembersChannel(teamPlayersCount){
  var min = {id : undefined , count : 999};
  for(element of teamPlayersCount){
    if(element.count < min.count)
      min = element;
  }
  return min
}

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}



function isAdmin(memberTag,message){
  if(memberTag == "Roklo!#0591" || memberTag == "taric#3591" || memberTag == "Zephi!!#0180")
    return true;
  else{
    message.channel.send("No tienes permisos para ejecutar este comando");
    return false;
  }
}
