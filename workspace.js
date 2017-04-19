var menuOpen = false;
var menuTarget = false;
var menuIds = ["driveFileMenu"];
var pdfType = "google"; //Let this equal iframe, object, google or library
var drag = {
	file: "",
	startPos: [0,0],
	elemStartPos: [0,0],
	threshold: 15, //The number of pixels dragged before the element moves

}
function createTile(name,type,contentLink,service){
	//Name generation:
	var searchedType = mimeTypes.getExtension(type); //Turn mime types into their appropriate extensions
	if(searchedType != false){
		type = searchedType;
	}
	var tile = document.createElement("DIV");
	if(service === "googledrive"){
		tile.title = name;
	}
	else{
		tile.title = name+"."+type;
	}
	//Create tile
	$(tile).dialog({
		
	});
	
	//Content rendering:
	var contentHolder = document.createElement("DIV");
	contentHolder.className = "contentHolder";
	switch(type){ //Document-type specific rendering code
		case "pdf":
			var contentFrame;
			if(pdfType === "library"){
				contentFrame = document.createElement("CANVAS");
				contentFrame.className = "contentFrame";
			}
			else if(pdfType === "iframe"){
				contentFrame = document.createElement("IFRAME");
				contentFrame.className = "contentFrame";
				httpGetFile(contentLink,function(resp){
					if(resp != false){
						contentFrame.src = createUrl(resp,"application/pdf");
					}
				});
			}
			else if(pdfType === "object"){
				contentFrame = document.createElement("OBJECT");
				contentFrame.className = "contentFrame";
				var contentSource = document.createElement("EMBED");
				contentFrame.setAttribute("type","application/pdf");
				contentSource.setAttribute("type","application/pdf");
				httpGetFile(contentLink,function(resp){
					if(resp != false){
						var link = createUrl(resp,"application/pdf");
						contentFrame.setAttribute("data",link);
						contentSource.src = link;
					}
				});
				contentFrame.appendChild(contentSource);
				
			}
			else if(pdfType === "google"){
				if(service === "dropbox"){
					contentFrame = document.createElement("IFRAME");
					contentFrame.className = "contentFrame";
					contentFrame.src = "https://docs.google.com/viewer?url="+contentLink+"&embedded=true";
				}
				else{
					contentFrame = document.createElement("IFRAME");
					contentFrame.className = "contentFrame";
					contentFrame.src = contentLink;
				}
			}
			else{
				console.error("Invalid PDF type: " + String(pdfType));
			}
		break;
			
		case "doc":
		case "docx":
		case "xlsx":
			var contentFrame;
			if(service === "dropbox"){
				contentFrame = document.createElement("IFRAME");
				contentFrame.className = "contentFrame";
				contentFrame.src = "https://docs.google.com/viewer?url="+contentLink+"&embedded=true";
			}
			else{
				contentFrame = document.createElement("IFRAME");
				contentFrame.className = "contentFrame";
				contentFrame.src = contentLink;
			}
			
		break;
		
		default:
			var contentFrame = document.createElement("DIV");
			
	}
	console.info(type);
//	var contentFrame = document.createElement("IFRAME");
//	contentFrame.className = "contentFrame";
//	contentFrame.src = contentLink;
	tile.appendChild(contentHolder);
	contentHolder.appendChild(contentFrame);
	if(pdfType === "library" && type === "pdf"){
		createPdf(contentLink,contentFrame); //Used for PDFJS
	}
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
	contentHolder.parentElement.parentElement.children[0].children[1].setAttribute("ondblclick","if(checkTarget(event)){toggleDialog(event);}");
	contentHolder.parentElement.parentElement.children[0].setAttribute("ondblclick","if(checkTarget(event)){toggleDialog(event);}");
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
	httpGetFile(src,function(data){
		if(data != false){
			newUrl = createUrl(data,"application/pdf");
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
function createUrl(data,type){
	var blob = new Blob([data],{"type":"application/pdf"});
	var newUrl = URL.createObjectURL(blob);
	return newUrl;
}
