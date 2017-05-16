function Grouper(id){
	var globalThis = this;
	var grouper = document.createElement("DIV");
	grouper.title = "Drag file here to group.";
	grouper.className = "grouper";
	grouper.id = id;
	grouper.innerHTML="<h2>New Group</h2>";
	/*$(grouper).dialog({
	"width": ($("body").width() * 0.2),
	"height": ($("body").height() * 0.2),
	"close": function(){
		$(this).remove();
	}
	});*/
	this.moveChildren = function(event){
//		var offset = event.
		for(var )
	}
	document.body.appendChild(grouper);
	$(grouper).tooltip();
	$(grouper).resizable();
	$(grouper).draggable({
		"drag": globalThis.moveChildren;
	});
	this.files = [];
	this.attach = function(event, ui){
		var elem = ui.draggable;
		globalThis.files.push(elem);
		
	}
	this.detach = function(event, ui){
		var elem = ui.draggable;
	}
	$(grouper).droppable({
		"accept": ".fileTile",
		"drop": globalThis.attach,
		"out": globalThis.detach
	});
	
	
}