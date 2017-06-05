module.exports = { //MANERA 1
  saludos : saludosMethod
 ,getParamsAsList : getParamsAsList
 ,newChannel : newChannel
 ,seConecto : seConecto
 ,seDesconecto : seDesconecto
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
        if(!(storage.getItemSync(mensaje.guild.id) == undefined)){
          aux = storage.getItemSync(mensaje.guild.id);
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

        auxuc.push(newChannel.id);
        aux[mensaje.author.id]=(auxuc);
        console.log(aux);
        storage.setItemSync(mensaje.guild.id,aux);
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
      if (new Date(new Date().getTime()+5*(-60000))>new Date(aux[miembro.id])){
        return;
      }
    }
  }
  miembro.voiceChannel.guild.defaultChannel.send("@here se conecto "+ miembro.nickname )
}

function seDesconecto(miembro,pila){
}

/*
module.exports = {   // MANERA 2
  saludos : function(){
    return "Hola wachem";
  }
}*/
