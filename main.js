/*
  A ping pong bot, whenever you send "ping", it replies "pong".
  */

// Import the discord.js module
const Discord = require('discord.js');
var storage = require('node-persist');


// IMPORT de utilidades
const library = require('./library.js');
const gameModule = require('./modules/gameModule.js');
const notificationModule = require('./modules/notificationModule.js');
const randomizeModule = require('./modules/randomizeModule.js');

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
  client.user.setGame("Code Testing buachin");
  console.log('I am ready!');

});

// Create an event listener for messages
client.on('message', message => {
  if (message.content.substring(0,5) == "nyan!"){ // Si empieza con nyan!
    var mensaje = message.content.substring(5);  // Guardar el contenido en variable auxiliar
    if(mensaje.includes('(')){ // Si tiene parametros
      cleanMsg = { command : mensaje.substring(0,mensaje.indexOf('(')) , params : library.getParamsAsList(mensaje)} // Separo en un json el comando y los parametros
      switch (cleanMsg.command) {  // Hacer un switch hasta los parametros
        case 'ch': gameModule.newChannel(cleanMsg.params , message, storage); break;
        case 'newGame' : gameModule.newGame(cleanMsg.params, message, storage); break;
        case 'randomize' : randomizeModule.randomize(cleanMsg.params, message); break;
        default : message.channel.send("Error: Comando desconocido");
      }
    }else{ // Si es una funcion sin parametros
      switch(mensaje){
        case 'ping': message.channel.send(client.ping); break;
        case 'destroyMe':
          if(library.isAdmin(message.author.tag,message)){
            message.channel.send("I'll be back").then(() => {
              client.destroy().then(()=>{
                process.exit();
              })
            });
          }
        break;
        case 'clearStorage':
          if(library.isAdmin(message.author.tag,message))
            storage.clear()
            .then(response =>{
              message.channel.send("Success");
            })
            .catch(error =>{
              message.channel.send("ERROR");
              console.log(error);
            })
          break;
        case 'clearAllChannels': // NOT WORKING
          if(library.isAdmin(message.author.tag,message)){
            var storageValue = storage.getItemSync(message.guild.id);
            if(storageValue != undefined){
              var channelList = storageValue.botChannelList;
              if(channelList != undefined){ 
                for(var userId in channelList){
                  for(var channelId of channelList[userId]){
                    message.guild.channels.get(channelId).delete();
                  }
                }
                storageValue.botChannelList = undefined;
                storage.setItemSync(message.guild.id,storageValue);
              }
            }
          }
          break;
        case 'startGame':
          gameModule.startGame(message,storage);
          break;
        case 'finishGame':
          gameModule.finishGame(message,storage);
          break;
        case 'toggleNotif': notificationModule.toggleNotif(message, storage); break;
        case 'randomizeHelp' : message.channel.send(randomizeModule.randomizeHelp(),{code:true}); break;
        case 'help' : message.channel.send(library.help(),{code : 'markdown'}); break;
        default : message.channel.send("Error: Comando desconocido");
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
      notificationModule.seConecto(newMember,avisos);
    }else if(newMember.voiceChannel==null || newMember.voiceChannel == undefined){
      avisos=notificationModule.seDesconecto(oldMember,avisos);
    }else if(oldMember.voiceChannel.guild.id==newMember.voiceChannel.guild.id){
      return;
    }
  } else console.log("DISABLED NOTIFS IN "+ newMember.guild.id);
});
// Log our bot in
client.login(token);