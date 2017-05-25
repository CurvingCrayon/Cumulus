var openGroupers = [];
function Grouper(id){
	var globalThis = this;
	var grouper = document.createElement("DIV");
	grouper.title = "Drag files here to group them.";
	grouper.className = "grouper";
	grouper.id = id;
	grouper.innerHTML="<h2 class='groupHead' ondblclick='changeTitle(event)'>New Group</h2>";
	grouper.style.position = "absolute";
	grouper.style.top = "0px";
	grouper.style.right = "100px";
	/*$(grouper).dialog({
	"width": ($("body").width() * 0.2),
	"height": ($("body").height() * 0.2),
	"close": function(){
		$(this).remove();
	}
	});*/
	this.toggleTooltip = function(event){
		var type = event.type;
		if(type === "mousedown"){
			$(grouper).tooltip("disable");
		}
		else if(type === "mouseup"){
			$(grouper).tooltip("enable");
			$(grouper).tooltip("open");
		}
	}
	this.r;
	this.g;
	this.b;
	this.generateColors = function(){
		this.r = Math.floor(Math.random()*128)+127;
		this.g = Math.floor(Math.random()*128)+127;
		this.b = Math.floor(Math.random()*128)+127;
		//var r2 = 255 - r;
		//var g2 = 255 - g;
		//var b2 = 255 - b;
		grouper.style.backgroundColor = "rgb("+String(this.r)+","+String(this.g)+","+String(this.b)+")";
		//grouper.children[0].style.color = "rgb("+String(r2)+","+String(g2)+","+String(b2)+")";
	}
	this.generateColors();
	grouper.onmousedown = this.toggleTooltip;
	grouper.onmouseup = this.toggleTooltip;
	this.moveChildren = function(event, ui){
		if(globalThis.files.length > 0){
			var newPos = ui.offset;
			var offset = [newPos.left-globalThis.pos[0],newPos.top-globalThis.pos[1]];
			
			for(var file = 0; file < globalThis.files.length; file++){
				var elem = globalThis.files[file].children[1];
				var elemFrame = globalThis.files[file];
				$(elem).dialog("option","position",{
					my: "left top", 
					at: "left+"+String(elemFrame.offsetLeft+offset[0])+" top+"+String(elemFrame.offsetTop+offset[1]), 
					of: $("body") 
				});
			}	
		}
		globalThis.setPos(ui.offset.left,ui.offset.top);
		/*$( ".selector" ).tooltip("option","show",false); //Disable animation
		$( ".selector" ).tooltip("option","hide",false); //Disable animation
		$(grouper).tooltip("close"); //reset position
		$(grouper).tooltip("open"); 
		$( ".selector" ).tooltip("option","show",true); //Disable animation
		$( ".selector" ).tooltip("option","hide",true); //Disable animation
*/
	}
	document.body.appendChild(grouper);
	$(grouper).tooltip();
	$(grouper).resizable();
	$(grouper).draggable({
		"drag": globalThis.moveChildren,
		"create": globalThis.initGroup,
		"stack": ".grouper"
	});
	this.files = [];
	this.pos = [0,0];
	this.attach = function(event, ui){
		var elem = ui.draggable[0];
		//console.info(elem);
		for(var file = 0; file < globalThis.files.length; file++){
			if(globalThis.files[file] === elem){
				globalThis.files.splice(file, 1); //Remove file from files array
			}
		}
		globalThis.files.push(elem);
		elem.style.backgroundColor = "rgba("+String(globalThis.r)+","+String(globalThis.g)+","+String(globalThis.b)+",0.5)";
	}
	
	this.detach = function(event, ui){
		var elem = ui.draggable[0];
		var found = false;
		for(var file = 0; file < globalThis.files.length; file++){
			if(globalThis.files[file] === elem){
				found = true;
				globalThis.files.splice(file, 1); //Remove file from files array
			}
		}
		elem.style.backgroundColor = "white";
	}
	$(grouper).droppable({
		"accept": ".fileTile",
		"drop": globalThis.attach,
		"out": globalThis.detach
	});
	this.setPos = function(x,y){
		globalThis.pos = [x,y];
	}
	this.setPos(grouper.offsetLeft,grouper.offsetTop);
}
function changeTitle(event){
	var targ = event.target;
	var p = document.createElement("P");
	p.innerHTML = "Change name of '"+targ.innerHTML+"' to:";
	var input = document.createElement("INPUT");
	input.type = "text";
	input.placeholder = "New name...";
	var holder = document.createElement("DIV");
	holder.title = "Name of '"+targ.innerHTML+"'.";
	holder.appendChild(p);
	holder.appendChild(input);
	$(holder).dialog({
		"modal": true,
		"buttons": {
			"Ok": function(){
				targ.innerHTML = input.value;
				$(this).dialog("close");
			},
			"Cancel": function(){
				$(this).dialog("close");
			}
		}
	});
}