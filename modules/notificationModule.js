module.exports = {
	seConecto : seConecto
   ,seDesconecto : seDesconecto
   ,toggleNotif : toggleNotif
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
