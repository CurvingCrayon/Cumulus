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
	var icon = document.createElement("IMG");
	icon.className = "fileIcon";
	switch(service){
		case "googledrive":
			icon.src = "../images/product16.png";
		break;
			
		case "dropbox":
			icon.src = "../images/drop16.png";
		break;
			
		case "onedrive":
		break;
	}
	contentHolder.parentElement.parentElement.children[0].insertBefore(icon,contentHolder.parentElement.parentElement.children[0].children[0]);
}