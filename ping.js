/*
  A ping pong bot, whenever you send "ping", it replies "pong".
  */

// Import the discord.js module
const Discord = require('discord.js');

// Create an instance of a Discord client
const client = new Discord.Client();

// The token of your bot - https://discordapp.com/developers/applications/me
const token = 'nope';

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
      switch (mensaje.substring(0,mensaje.indexof('(')-1)) {  // Hacer un switch hasta los parametros
        case 'ch':
        console.log(client.guilds);
        var guilds =client.guilds;
        for (var [key, guild] of guilds) {
          console.log(guild);
        }
        guild.createChannel('new-general', 'text');
        break;
      }
    }else{
      switch(mensaje){
        case 'ping':
        message.channel.send(client.ping);
        break;
        case 'destroyMe':
        message.channel.send("I'll be back").then(() => {
          client.destroy();
          process.exit();
        });
        break;
      }
    }
  }
});

// Log our bot in
client.login(token);