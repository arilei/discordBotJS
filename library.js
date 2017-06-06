module.exports = { //MANERA 1
  saludos : saludosMethod
 ,getParamsAsList : getParamsAsList
 ,newChannel : newChannel
 ,seConecto : seConecto
 ,seDesconecto : seDesconecto
 ,toggleNotif : toggleNotif
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
            console.log(aux);
            console.log('___________________________');
            console.log(mensaje.author.id);
            console.log('___________________________');
            console.log(aux[mensaje.author.id]);
            console.log('___________________________');
            if (!(aux[mensaje.author.id]==undefined)){
              auxuc=aux[mensaje.author.id];
              var strauxuc =aux[mensaje.author.id];
              console.log(strauxuc);
              console.log('___________________________');
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
  console.log('___________________________');
  console.log(aux);
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