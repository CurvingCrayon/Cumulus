var menuOpen = false;
var menuTarget = false;
var menuIds = ["driveFileMenu"];
function createTile(name,type,contentLink,service){
	//Name generation:
	switch(type){
		case "application/vnd.google-apps.document":
			type = "doc";
		break;
			
		case "application/vnd.google-apps.folder":
			type = "folder";
		break;
			
		case "application/vnd.google-apps.presentation":
			type = "powerpoint";
		break;
			
	}
	var tile = document.createElement("DIV");
	tile.title = name+"."+type;
	//Create tile
	$(tile).dialog({
		
	});
	
	//Content rendering:
	var contentHolder = document.createElement("DIV");
	contentHolder.className = "contentHolder";
	switch(type){
		case "pdf":
		//Object version: (incomplete)
			//var contentFrame = document.createElement("IFRAME");
			//contentFrame.className = "contentFrame";
			//contentFrame.src = contentLink;
		//PDFJS version:
			var contentFrame = document.createElement("CANVAS");
			contentFrame.className = "contentFrame";
		break;
			
	}
//	var contentFrame = document.createElement("IFRAME");
//	contentFrame.className = "contentFrame";
//	contentFrame.src = contentLink;
	contentHolder.appendChild(contentFrame);
	tile.appendChild(contentHolder);
	console.info(contentLink);
	createPdf(contentLink,contentFrame); //Used for PDFJS
	//Icon selection:
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
	contentHolder.parentNode.parentNode.children[0].insertBefore(icon,contentHolder.parentNode.parentNode.children[0].children[0]);
	var bgImg = "";
	switch(type){
		case "doc":
		case "docx":
			bgImg = "../images/docBg.png";
		break;
	}
	contentHolder.parentElement.parentElement.style.backgroundImage = "url('"+bgImg+"')";
	contentHolder.parentElement.parentElement.children[0].children[0].setAttribute("ondblclick","if(checkTarget(event){toggleDialog(event);}");
	contentHolder.parentElement.parentElement.children[0].setAttribute("ondblclick","if(checkTarget(event){toggleDialog(event);}");
}
function menu(event){
	targ = event.target;
	if(targ != document.body){
		menuOpen = true;
		menuTarget = targ;
		if($(targ).hasClass("fileOptionThumb") || $(targ).hasClass("fileOption")){ //Google File Options
			if($(targ).hasClass("fileOptionThumb")){
				menuTarget = targ.parentNode;
			}
			event.preventDefault();
			$("#driveFileMenu").css({
				left: String(event.clientX)+"px",
				top: String(event.clientY)+"px"
			});
			for(var menuNum in menuIds){
				$("#"+menuIds[menuNum]).hide();
			}
			$("#driveFileMenu").show();
		}
		else if(true){
			
		}
		else{
			
		}
		//
		return false;
	}
}
function checkClick(event){
	var clickedMenu = false;
	for(var menuNum in menuIds){
		if(document.getElementById(menuIds[menuNum]).contains(event.target)){
			clickedMenu = true;
			console.log("clicked menu!");
		}
	}
	if(!clickedMenu){
		for(var menuNum in menuIds){
			$("#"+menuIds[menuNum]).hide();
		}
	}

}
function createPdf(src,elem){
	httpGetPdf(src,function(data){
		if(data != false){
			newUrl = blobUrlPdf(data);
			PDFJS.getDocument(newUrl).then(function(newPdf){
				newPdf.getPage(1).then(function(newPage){
					var scale = 1;
					var viewport = newPage.getViewport(scale);
					var context = elem.getContext("2d");
					newPage.render({ 
						canvasContext: context, 
						viewport: viewport
					});
				});
			});
		}
	});
}
function blobUrlPdf(data){
	var blob = new Blob([data],{"type":"application/pdf"});
	var newUrl = URL.createObjectURL(blob);
	return newUrl;
}