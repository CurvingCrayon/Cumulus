var tabSpeed = "fast";
var tabOffset= "-100px";
var mainColor = "#FFCC00";
var semiMainColor = "rgba(255,240,179,0.9)";
$(function(){
	dropboxInit();
	$(".tile").dialog(); //Defines class as jquery UI object
	$("button").button(); //Defines tag as jquery UI object
	$("#driveSelectFile").button("disable"); //Disables google drive open file button
	$("#dropboxSelectFile").button("disable"); //Disables dropbox open file button
	$("#driveFileMenu").menu();
	$("#driveFileMenu").hide();
	$(".footerElem").button();
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
	var dropButton = Dropbox.createChooseButton(getDropboxOptions());
	//$(document.getElementsByClassName("tab")[1].children[1]).after(dropButton);
	

});
function httpPostAsync(url, callback, header){
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function() { 
		if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
			callback(xmlHttp.responseText);
		}
		else{
			callback(false);
		}
	}
	xmlHttp.open("POST", url, true); // true for asynchronous 
	if(typeof header !== "undefined"){ //If the header parameter is given
		xmlHttp.setRequestHeader(header[0],header[1]);
	}
	xmlHttp.send(null);
}
function httpGetAsync(url, callback, body, header){
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function(){ 
		if(xmlHttp.readyState == 4 && xmlHttp.status == 200){
			callback(xmlHttp.responseText);
		}
		else{
			callback(false);
		}
	}
	xmlHttp.open("GET", url, true); // true for asynchronous 
	if(typeof header !== "undefined"){ //If the header parameter is given
		xmlHttp.setRequestHeader(header[0],header[1]);
	}
	if(typeof body !== "undefined"){ //If a body parameter is given
		body = JSON.stringify(body); //Turn the body object into a string
		xmlHttp.send(body);
	}
	else{
		xmlHttp.send(null);
	}
}
function httpGetFile(url, callback, body, header){
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function(){ 
		if(xmlHttp.readyState == 4 && xmlHttp.status == 200){
			callback(xmlHttp.response);
		}
		else{
			callback(false);
		}
	}
	xmlHttp.responseType = "blob";
	xmlHttp.open("GET", url, true); // true for asynchronous 
	if(typeof header !== "undefined"){ //If the header parameter is given
		xmlHttp.setRequestHeader(header[0],header[1]);
	}
	xmlHttp.send();
}
//http://che.org.il/wp-content/uploads/2016/12/pdf-sample.pdf
function getData(url){
	if(url == undefined){
		url = "/testDocuments/document.pdf";
	}
	httpGetFile(url,function(data){
		if(data != false){
			glob = data;
			var blob = new Blob([data],{"type":"application/pdf"});
			var newURL = URL.createObjectURL(blob);
			glob7 = newURL;
			PDFJS.getDocument(newURL).then(function (pdf) {
			pdf.getPage(1).then(function (page) {
				var scale = 1;
				var viewport = page.getViewport(scale);
				var canvas = document.getElementById("the-canvas");
				var context = canvas.getContext("2d");
				canvas.height = viewport.height;
				canvas.width = viewport.width;
				page.render({ canvasContext: context, viewport: viewport });
			});
		  });
			//window.open("data:application/pdf;base64, " + data, "", 'height=650,width=840');

		}
	});
}
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
			glob2 = reader.result;
			glob3 = new Uint8Array(reader.result);
			
			notify("load",[fileType,reader.name]);
		};
	})(files[0]);
	//reader.readAsText(files[0]);
	reader.readAsArrayBuffer(files[0]);
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
	if(event.type === "mouseleave"){
		$(elem).animate({"top":tabOffset},tabSpeed);
		elem.setAttribute("data-open","false");
	}
	else{
		$(elem).animate({"top":"0px"},tabSpeed);
		elem.setAttribute("data-open","true");
	}
}
function toggleDialog(event){
	var elem = event.currentTarget;
	var numLoops = 0;
	var maxLoops = 10;
	var foundElem = false;
	//Find the eldest parent of the dialog box
	while(!foundElem && numLoops < maxLoops){ //Keep going to the parent until you get the eldest. Do this a only a certain number of times
		if(elem.hasAttribute("role") && elem.getAttribute("role") === "dialog"){
			foundElem = true;
		}
		else{
			elem = elem.parentNode;
		}
		numLoops++;
	}

	if(numLoops >= maxLoops){
		console.error("toggleDialog could not find correct parent");
	}
	else{
		elem = elem.children[1];
		var prevHeight = elem.getAttribute("data-height");
		if(prevHeight == null){
			elem.setAttribute("data-height",$(elem).height());
			$(elem).animate({
				"height": "0px",
				"min-height": "0px"
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
				elem.parentNode.style.height="auto";
				$(elem).animate({
					"height": "0px",
					"min-height": "0px"
				});
			}
		}
	}	
}
//This handles fileOptions being clicked
function fileClicked(event){
	var elem = event.currentTarget;
	var allFiles = elem.parentNode.children; //All the files currently in the file window
	var parentId = elem.parentNode.getAttribute("id");
	var service = elem.parentNode.getAttribute("data-service");
	var arrDialogs;
	switch(service){
		case "dropbox":
			arrDialogs = openDropboxDialogs;
		break;
			
		case "googledrive":
			arrDialogs = openDialogs;
		break;
			
		default:
			console.error("findDialogs given invalid service name: "+service);
		break;
	}
	var dialogIndex = findDialog(parentId,service);
	if(dialogIndex != -1){
		var selectedFiles = arrDialogs[dialogIndex].selectedFiles;
	}
	else{
		console.error("Dialog Index not found for clicked file.")
	}
	if(event.ctrlKey){ //If the control key was being held
		var result = searchArray(selectedFiles, elem);
		if(!result){ //If the file hadn't already been selected
			//Select that file
			selectedFiles.push([elem,$(elem).attr("data-id")]);
			$(elem).css(activeFileStyle());
		}
		else{//If the file had already been selected
			//Deselect that file
			$(selectedFiles[result[0]]).css(inactiveFileStyle());
			var removedElem = selectedFiles.splice(result[0],1);

		}
	}
	else if(event.shiftKey){ //If the shift key was being held
		var result = searchArray(selectedFiles, elem);
		if(!(result == false)){ //If the file has already been selected
			selectedFiles.splice(result[0],1); //Deselect it
		}
		else{ //If the file hasnt already been selected
			$(elem).css(activeFileStyle()); //Select it
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
	arrDialogs[dialogIndex].selectedFiles = selectedFiles;
	arrDialogs[dialogIndex].updateOpenFileButton(selectedFiles.length);
}
function deselectAllFiles(event){
	var elem = event.currentTarget;
	var parentId = elem.getAttribute("id");
	var parentService = elem.getAttribute("data-service");
	var arrDialogs;
	switch(parentService){
		case "dropbox":
			arrDialogs = openDropboxDialogs;
		break;
			
		case "googledrive":
			arrDialogs = openDialogs;
		break;
			
		default:
			console.error("findDialogs given invalid service name: "+service);
		break;
	}
	var allFiles = elem.children;
	for(var fileNum = 0; fileNum < allFiles.length; fileNum++){
		$(allFiles[fileNum]).css(inactiveFileStyle());
	}
	var dialogIndex = findDialog(parentId,parentService);
	if(dialogIndex != -1){
		arrDialogs[dialogIndex].updateOpenFileButton(0);
		arrDialogs[dialogIndex].selectedFiles = [];
	}
	else{
		console.error("Dialog Index not found for deselecting files.")
	}
}
function activeFileStyle(){
	return {
		"border": "2px solid" + mainColor,
		"padding": "8px",
		"backgroundColor": semiMainColor
	}
}
function inactiveFileStyle(){
	return {
		"border": "none",
		"padding": "10px",
		"backgroundColor": "rgba(255,255,255,0.9)"
	}
}
function activeTabStyle(){
	return{
		"border-color": "#0089ff",
		"box-shadow": "0 0 7px #0089ff"
	}
}
function inactiveTabStyle(){
	return{
		"border-color": "gray",
		"box-shadow": "0 0 7px black"
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
function refreshImage(event){
	
}
function denyEvent(event){
	event.stopPropagation();
	event.preventDefault();
	return false;
}
function checkTarget(event, elements, callback){ //This function checks that a child is not trigger an elements event
	if(event.target == undefined){
		console.error("Bad 'event' object passed to checkTarget().");
		return false;
	}
	if(event.target == event.currentTarget){
		try{
			callback();
		}
		catch(e){

		}
	}
	return event.target == event.currentTarget;
}
function subtractString(original,remover){
	var pos = original.search(remover);
	var out = ""
	if(pos == -1){
		console.error("subtractString passed bad strings: " + original + " " + remover);
		out = "ERROR";
	}
	else{
		out = original.substr(0,pos) + original.substr(pos+remover.length, original.length -1);
	}
	return out;
}
