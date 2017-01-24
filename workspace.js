function createTile(name,type,contentLink,service){
	var tile = document.createElement("DIV");
	tile.title = name+"."+type;
	$(tile).dialog({
		
	});
	var contentHolder = document.createElement("DIV");
	contentHolder.className = "contentHolder";
	var contentFrame = document.createElement("IFRAME");
	contentFrame.className = "contentFrame";
	contentFrame.src = contentLink;
	contentHolder.appendChild(contentFrame);
	tile.appendChild(contentHolder);
}