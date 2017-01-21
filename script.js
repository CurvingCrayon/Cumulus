var tabSpeed = "fast";
var tabOffset= "-100px";
var mainColor = "#FFCC00";
var semiMainColor = "rgba(255,204,0,0.3)";
var selectedFiles = [[false,false]]; //2d array with [DOM element, file id]
$(function(){
	$(".tile").dialog(); //Defines class as jquery UI object
	$("button").button(); //Defines tag as jquery UI object
	$("#fileSelector").dialog({ //Defines ID as jquery UI object
		"width": ($("body").width() * 0.8),
		"height": ($("body").height() * 0.8),
	}); 
	$("#driveAuth").hide(); //Hides the 'authorize' button (handled by checkAuth()->handleAuthResult())
	$(".tab").css({"top":tabOffset}); //Position the tabs to 'closed' position
	$(".tab").on({ //Assigns event handlers to the tabs
		"mouseenter":toggleTab,
		"mouseleave":toggleTab
	});
	$(".ui-dialog-titlebar").on({
		"dblclick": toggleDialog
	});
	$(document).tooltip({
		items: "[data-tooltip]",
		content: function(){
			var tipElem = this;
			if($(tipElem).is("[data-tooltip]")){
				return tipElem.getAttribute("data-tooltip");
			}
		}
	});
	$(".fileOption").on("click",fileClicked);
	var dropButton = Dropbox.createChooseButton(getDropOptions());
	//$(document.getElementsByClassName("tab")[1].children[1]).after(dropButton);
});

var content;
function handleDrop(event){
	event.stopPropagation();
	event.preventDefault();
	var files = event.dataTransfer.files;
	var reader = new FileReader();
	reader.onprogress = (function(theFile) {
		return function(e) {
			if(e.target.lengthComputable){
				console.log(e.target.loaded);
			}
			else{
				console.log("Length not computable.")
			}
		};
	})(files[0]);
	reader.onload = (function(theFile) {
		return function(e) {
//			generateItem(e.target.result);
			console.log("Loaded");
			generateItem(reader.result);
//			console.log(e.target.result);
			
		};
	})(files[0]);
	reader.readAsDataURL(files[0]);
}	
function handleDrag(event){
	//event.target.style.boxShadow = "0 0 10px black";
	event.stopPropagation();
	event.preventDefault();
	event.dataTransfer.copyEffect = "copy";
}
function generateItem(url){
	
	document.body.innerHTML += "<img src='"+url+"' />";
	/*var parts = url.split("."); //This will create an array based on "."
	var type = parts[parts.length-1]; //This will get the file extension
	switch(type){
		case "png":
		case "jpg":
		case "jpeg":
			//document.body.innerHTML += "<img src='"+url+" />";
		break;
		
		default:
			console.error("Unknown file type in generateItem(): "+type);
		break;
	}*/
	
}
function handleFile(event){
	var uploadedFiles = event.target.files;
//	for(var fileNum = 0; fileNum < uploadedFiles.length - 1; uploadedFiles++){
//		var newReader = new FileReader();
//		newReader.onload = (function(){
//			document.body.html += "<iframe src='"+ newReader.result + "'></iframe>";
//			console.log(newReader.result);
//		})(uploadedFiles[fileNum]);
//		newReader.readAsDataURL(uploadedFiles[fileNum]);
//	}
	files = uploadedFiles;
	var reader = new FileReader();
	var fileType = files[0].type;
	reader.onprogress = (function(theFile) {
		return function(e) {
			if(e.target.lengthComputable){
				console.log(e.target.loaded);
			}
		};
	})(files[0]);
	reader.onload = (function(theFile) {
		return function(e) {
			switch(fileType){
				case "text/plain":
					generate.text(reader.result);
				break;

				default:
					generate.image(reader.result);
				break;
			}
			notify("load",[fileType,reader.name]);
		};
	})(files[0]);
	switch(fileType){
		case "text/plain":
			reader.readAsText(files[0]);
		break;

		default:
			reader.readAsDataURL(files[0]);
		break;
	}
}
function getProgress(event){
	if(event.lengthComputable){
		console.log(event.loaded/event.total);
	}
}
var generate = {
	image: function(url){
		var newContent = document.createElement("IMG");
		newContent.onprogress = getProgress(event);
		newContent.src = url;
		document.body.appendChild(newContent);
	},
	text: function(content){
		content = formatTextFile(content);
		var newContent = document.createElement("P");
		newContent.onprogress = getProgress(event);
		newContent.innerHTML = content;
		document.body.appendChild(newContent);
	},
}
function formatTextFile(text){
	text = text.replace(/\n/g,"<br/>");
	text = text.replace(/ /g,"&nbsp;");
	return text;
}
function notify(notType, params){
	switch (notType) {
		case "load":
			//params = [fileType, fileName]; STRUCTURE
			var fileType = params[0];
			fileType = fileType.split("");
			fileType[0] = fileType[0].toUpperCase();
			fileType = fileType.join("");
			fileType = fileType.split("/");
			fileType = fileType[0];
			var fileName = params[1];
			document.getElementById("noteHolder").innerHTML += "<p>" + fileType +" has been loaded.</p>";
		break;
		
		default:
		break;
	}
}
function getNums(text){
	var text = text.split("");
	var num = "";
	for(var x = 0; x < text.length; x++){
		if(!isNaN(text[x])){
			num += text[x];
		}
	}
	return Number(num);
}
function showTitle(event){
	if(event.target.className === "tileName"){
		$(event.target.parent).animate({"scrollLeft":"100px"});
	}
	else{
		$(event.target).animate({"scrollLeft":"100px"});
	}
}
function hideTitle(event){
	$(event.target.parent).animate({"scrollLeft":"0px"});
}
function toggleTab(event){
	var elem = event.currentTarget;
	var enabled = elem.getAttribute("data-open");
	$(elem).stop(true);
	if(enabled === "true"){
		$(elem).animate({"top":tabOffset},tabSpeed);
		elem.setAttribute("data-open","false");
	}
	else{
		$(elem).animate({"top":"0px"},tabSpeed);
		elem.setAttribute("data-open","true");
	}
}
function toggleDialog(event){
	var elem = event.currentTarget.parentElement.children[1];
	var prevHeight = elem.getAttribute("data-height");
	if(prevHeight == null){
		elem.setAttribute("data-height",$(elem).height());
		$(elem).animate({
			"height": "0px"
		});
	}
	else{
		if($(elem).height() == 0){
			$(elem).animate({
				"height": prevHeight
			});
		}
		else{
			elem.setAttribute("data-height",$(elem).height());
			elem.parentElement.style.height="auto";
			$(elem).animate({
				"height": "0px"
			});
		}
	}
	
}
function fileClicked(event){
	var elem = event.currentTarget;
	var allFiles = $("#fileSelector").children(); //All the files currently in the 
	if(event.ctrlKey){
		var result = searchArray(selectedFiles, elem);
		if(!result){
			selectedFiles.push([elem,$(elem).attr("data-id")]);
			$(elem).css(activeFileStyle());
		}
		else{
			$(selectedFiles[result[0]]).css(inactiveFileStyle());
			var removedElem = selectedFiles.splice(result[0],1);
			console.log(removedElem)
		}
	}
	else if(event.shiftKey){
		var result = searchArray(selectedFiles, elem);
		if(!(result == false)){
			selectedFiles.splice(result[0],1);
		}
		else{
			$(elem).css(activeFileStyle());
		}
		selectedFiles.push([elem,$(elem).attr("data-id")]);
		var startElem = selectedFiles[selectedFiles.length - 2][0];
		var indexes = []; //indexes of the start and finish points for the shift-select
		for(var fileNum = 0; fileNum < allFiles.length; fileNum++){
			if(allFiles[fileNum] == elem || allFiles[fileNum] == startElem){
				indexes.push(fileNum);
			} 
		}
		for(var fileNum = (indexes[0] + 1); fileNum < indexes[1]; fileNum++){
			var result = searchArray(selectedFiles,allFiles[fileNum]);
			if(!result){
				selectedFiles.splice(selectedFiles.length-1,0,[allFiles[fileNum],$(allFiles[fileNum]).attr("data-id")]);
				$(allFiles[fileNum]).css(activeFileStyle());
			}
		}
	}
	else{
		for(var fileNum = 0; fileNum < allFiles.length; fileNum++){
			$(allFiles[fileNum]).css(inactiveFileStyle());
		}
		selectedFiles = [];
		selectedFiles.push([elem,$(elem).attr("data-id")]);
		$(elem).css(activeFileStyle());
	}
//	console.log(selectedFiles);
}
function activeFileStyle(){
	return {
		"border": "4px solid" + mainColor,
		"padding": "16px",
		"backgroundColor": semiMainColor
	}
}
function inactiveFileStyle(){
	return {
		"border": "none",
		"padding": "20px",
		"backgroundColor": "rgba(0,0,0,0)"
	}
}
function searchArray(arr, obj){
	var result = false;
	for(var i = 0; i < arr.length; i++){
		if(arr[i][0] == obj){
			if(result == false){
				result = [i];
			}
			else{
				result.push(i);
			}
		}
	}
	return result;
}
function openFolder(event){
	console.log(event.currentTarget.getAttribute("data-id"));
}