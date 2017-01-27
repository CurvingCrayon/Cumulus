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
	icon.style.float = "left";
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
	var bgImg = "";
	switch(type){
		case "doc":
		case "docx":
			bgImg = "../images/docBg.png";
		break;
	}
	contentHolder.parentElement.parentElement.style.backgroundImage = "url('"+bgImg+"')";
	$(contentHolder.parentElement.parentElement.children[0]).on({
		"dblclick": toggleDialog
	});
}