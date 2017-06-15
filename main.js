/*
  A ping pong bot, whenever you send "ping", it replies "pong".
  */

// Import the discord.js module
const Discord = require('discord.js');
const library = require('./library.js');
var storage = require('node-persist');
// Create an instance of a Discord client
const client = new Discord.Client();

var avisos={};

// The token of your bot - https://discordapp.com/developers/applications/me
const token = require('./token.js').token;

storage.initSync();
console.log('Storage initialized');
// The ready event is vital, it means that your bot will only start reacting to information
// from Discord _after_ ready is emitted
client.on('ready', () => {
  console.log('I am ready!');

});

// Create an event listener for messages
client.on('message', message => {
  if (message.content.substring(0,5) == "nyan!"){ // Si empieza con nyan!
    var mensaje = message.content.substring(5);  // Guardar el contenido en variable auxiliar
    if(mensaje.includes('(')){ // Si tiene parametros
      cleanMsg = { command : mensaje.substring(0,mensaje.indexOf('(')) , params : library.getParamsAsList(mensaje)} // Separo en un json el comando y los parametros
      switch (cleanMsg.command) {  // Hacer un switch hasta los parametros
        case 'ch': library.newChannel(cleanMsg.params , message, storage); break;          // Llama a la funcion newChannel de library.js
      }
    }else{ // Si es una funcion sin parametros
      switch(mensaje){
        case 'ping':
        message.channel.send(client.ping);
        break;
        case 'destroyMe':
          if(isAdmin(message.author.tag)){
            message.channel.send("I'll be back").then(() => {
              client.destroy().then(()=>{
                process.exit();
              })
            });
          }
          else message.channel.send("Unauthorized. Bitch");
        break;
        case 'clearStorage':
          if(isAdmin(message.author.tag))
            storage.clear()
            .then(response =>{
              message.channel.send("Success");
            })
            .catch(error =>{
              message.channel.send("ERROR");
              console.log(error);
            })
          break;
        case 'clearAllChannels':
          if(isAdmin(message.author.tag)){
            var storageValue = storage.getItemSync(message.guild.id);
            if(storageValue != undefined){
              var channelList = storageValue.botChannelList;
              if(channelList != undefined){ 
                for(var userId in channelList){
                  for(var channelId of channelList[userId]){
                    console.log(channelId);
                    message.guild.channels.get(channelId).delete();
                  }
                }
                storageValue.botChannelList = undefined;
                storage.setItemSync(message.guild.id,storageValue);
              }
            }
          }
          break;
        case 'saluda':
          message.channel.send(library.saludos()); // Testing code
          break;
        case 'toggleNotif': library.toggleNotif(message, storage); break;
      }
    }
  }
});

client.on('voiceStateUpdate',(oldMember,newMember) =>{
  var guildNotifStatus = storage.getItemSync(newMember.guild.id)
  if(guildNotifStatus == undefined)
    guildNotifStatus = {notificationsEnabled : true};
  if(guildNotifStatus.notificationsEnabled){
    if (oldMember.voiceChannel==null || oldMember.voiceChannel == undefined){
      library.seConecto(newMember,avisos);
    }else if(newMember.voiceChannel==null || newMember.voiceChannel == undefined){
      avisos=library.seDesconecto(oldMember,avisos);
      console.log('___________________________');
      console.log(avisos);
    }else if(oldMember.voiceChannel.guild.id==newMember.voiceChannel.guild.id){
      console.log('___________________________');
      console.log(oldMember.voiceChannel.guild.id);
      console.log('viejo /| nuevo V se cambio de sv');
      console.log(newMember.voiceChannel.guild.id);
      return;
    }
  } else console.log("DISABLED NOTIFS IN "+ newMember.guild.id);
});
// Log our bot in
client.login(token);


/* NO ESTABA FUNCANDO
function crearPartida(nombre,equipos,guild){
  miembros=miembros||'';
  var i;
  if (miembros==''){
    for (i = 0; i < equipos; i++) {
    guild.createChannel(nombre+i, 'voice');
  }
  }
}

}*/
function isAdmin(memberTag){
  return memberTag == "Roklo!#0591" || memberTag == "taric#3591" || memberTag == "Zephi!!#0180"
;
}