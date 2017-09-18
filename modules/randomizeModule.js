module.exports = { randomizeHelp : randomizeHelp
				 , randomize : randomize};


var randSets = { aoe2 : ["Britons","Byzantines","Celts","Chinese","Franks","Goths","Japanese","Mongols","Persians","Saracens","Teutons","Turks","Vikings","Aztecs","Huns","Koreans","Mayans","Spanish","Incas","Indians","Italians","Magyars","Slavs","Berbers","Ethiopians","Malians","Portuguese","Burmese","Khmer","Malay","Vietnamese"]}


function randomizeHelp (){
	return `#Randomize Help

Usage: nyan!randomize(amount,a,b,...) or nyan!randomize(amount,predefinedSet)

Predefined sets:
* aoe2 : Age of Empires 2 civilizations`
}

function randomize (params, message){
	var items = [];
	var amount = params[0];
	if(params.length == 2){
		var items  = randSets[params[1]];
		if(items == undefined){
			message.channel.send("Error al buscar el set. Use nyan!randomizeHelp para saber como utilizar este comando");
			return;
		}else{
			items = items.slice(); // .slice() asi copia el array a uno nuevo y no utiliza un puntero del anterior (el predefinido)
		}
	}
	else if(params.length > 2){
		var amount = params[0];
		var items = params.splice(1);
	}else{
		message.channel.send("Comando invalido. Use nyan!randomizeHelp para saber como utilizar este comando");
		return;
	}

	if(items.length < amount){
		message.channel.send("Cantidad maxima del set superada, seleccionando la cantidad maxima...");
		amount = items.length;
	}

	message.channel.send(generateString(items,amount),{code:true});
}




// AUXILIAR

function randomizeFromArray(array){
	return array[Math.floor(Math.random() * array.length)]
}


function generateString(array,amount){
	var randomList = "";
	for(var i = 1; i<=amount; i++){
			var randomElem = randomizeFromArray(array);
			array.splice( array.indexOf(randomElem) ,1);
			randomList += i + ". "+ randomElem +"\n";
	}
	return randomList;
}