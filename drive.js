//To get the client and app id go to: https://console.developers.google.com/apis/dashboard
var CLIENT_ID = "905474582382-5kuikj9l46duojj4flfd3q2e6aogg02v.apps.googleusercontent.com";
var appId = "905474582382"; //The app ID is just the first few numbers before the dash of the client ID
var SCOPES = ["https://www.googleapis.com/auth/drive","https://www.googleapis.com/auth/plus.login","https://www.googleapis.com/auth/plus.me"];

var googleInfo = {};

var imageQue = [];

var openDialogs = [];

var imageLoading = false;
var dialogStringLength = 5;

var standardRequest = {  //Default parameters for the Google Drive API to view files
	//"pageSize": 10,
	"corpus": "user",
	"spaces": "drive",
	"quotaUser": createString(5),
	"q": "'root' in parents", //Search query
	"orderBy": "name",
	"fields": "files(id, name, iconLink, thumbnailLink, parents, mimeType,webViewLink,webContentLink,trashed)" //Defines the information returned for the files
	//Others include: webViewLink, webContentLink, nextPageToken
 }
function handleAuthClick(event) { //This function is called by the "login" button
	gapi.auth.authorize({
		client_id: CLIENT_ID, 
		scope: SCOPES, 
		immediate: false},
		handleAuthResult
	);
	return false;
}
function checkAuth() { //THis is called by the API itself once it loads
    //This essentially checks if the user is already logged in
	console.log("Checking Google Drive auth...");
    gapi.auth.authorize({
	"client_id": CLIENT_ID,
	"scope": SCOPES.join(" "),
	"immediate": true,
        "prompt": "login"
    }, handleAuthResult); //This then calls handleAuthResult
}
function handleAuthResult(authResult) {
	if (authResult && !authResult.error) { //If the login is successful
		console.groupCollapsed("Google Drive successfully authorized.");
		console.log(authResult);
		console.groupEnd();
		$("#driveAuth").hide(); //Hide the login button
		$("#driveSelectFile").show(); //Show the select file button
		$("#driveSelectFile").button("enable");
		$("#driveLogout").show();
		$("#driveTab").css(activeTabStyle());

	  	loadDriveApi();
		loadProfileApi();
	}
	else {
		console.groupCollapsed("Google Drive unsuccessful.");
		console.log(authResult);
		console.groupEnd();
		$("#driveAuth").show();
		$("#driveSelectFile").hide();
		$("#driveLogout").hide();
	}
}
function loadProfileApi(){
	gapi.client.load("plus", "v1", initProfile);
}
function initProfile(){
	var requestInfo = gapi.client.plus.people.get({
		'userId' : 'me'
	});
	requestInfo.execute(function(resp) {
		googleInfo.id = resp.id;
		googleInfo.name = resp.displayName;
		googleInfo.image = resp.image.url;
		try{
			googleInfo.url = resp.url;
		}
		catch(e){
			googleInfo.url = false;
			console.error("Signed in user has no profile URL.");
		}
		loadGoogleImage(googleInfo.image);
	});
}
function loadDriveApi() {
	gapi.client.load("drive", "v3", initDrive);
}
function initDrive(){
	$("#driveSelectFile").button("enable");
}

function driveLogout(){
	gapi.auth.signOut(); //Sign out of the Drive API
	$("#driveAuth").show();
	$("#driveLogout").hide();
	$("#driveSelectFile").hide();
	$("#driveProfilePic").remove();
	$("#driveTab").css(inactiveTabStyle());
	googleInfo = {}; //Clear account information
	window.open("http://accounts.google.com/logout","_blank");
}

function loadGoogleImage(src){
	var newImg = document.createElement("IMG");
	var originalImg = document.getElementById("driveIcon");
	var holder = document.getElementById("driveTabHolder");
	newImg.className = "tabIcon profileIcon";
	newImg.id = "driveProfilePic";
	newImg.style.opacity = "0";
	newImg.style.verticalAlign = "top";
	holder.insertBefore(newImg,originalImg);
	queImage(newImg, src, function(){
		$(newImg).animate({"opacity":1});
	});
	loadNextImage();
}
function previewDriveFiles() {
	var dialog = createDialog();
	dialog.loadFileSelections(standardRequest);
}
function createDialog(){
	var rand = createString(dialogStringLength);
	var dialog = new GoogleDialog(rand); //Each dialog is given their own random id
	openDialogs.push(dialog);
	return dialog;
}

function refreshFiles(){
	
}


function confirmDelete(callback){
	var fileName = menuTarget.getAttribute("data-name");
	var newDialog = document.createElement("DIV");
	newDialog.id = "deleteDialog";
	newDialog.title = "Delete file?"
	var dialogText = document.createElement("P");
	var dialogIcon = document.createElement("SPAN");
	dialogIcon.className ="ui-icon ui-icon-alert";
	dialogIcon.id = "deleteDialogIcon";
	dialogText.appendChild(dialogIcon);
	dialogText.innerHTML += "Are you sure you want to delete the file \""+fileName+"\"?";
	newDialog.appendChild(dialogText);
	document.body.appendChild(newDialog);
	$(newDialog).dialog({
		resizable: false,
	  	height: "auto",
	  	width: 400,
	  	modal: true,
	  	buttons: {
			"Delete": function() {
				callback();
				$( this ).dialog( "close" );
			},
			Cancel: function() {
				$( this ).dialog( "close" );
			}
		}
	});
}
function deleteFile(){
	var fileId = menuTarget.getAttribute("data-id");
	var request = gapi.client.drive.files.delete({
		"fileId": fileId
	});
	request.execute(function(resp){
		console.log(resp);
	});
}
function openSelectedFiles(event){
	var elem = event.currentTarget;
	var id = elem.parentNode.parentNode.parentNode.children[1].getAttribute("id");
	var service = elem.parentNode.parentNode.parentNode.children[1].getAttribute("data-service");
	var batch = gapi.client.newBatch();
	var dialogIndex = findDialog(id,service);
	if(dialogIndex != -1){ //If the dialog box is found
		var selectedFiles = openDialogs[dialogIndex].selectedFiles;
		for(var fileNum in selectedFiles){
			var file = selectedFiles[fileNum][0];
			var name = file.getAttribute("data-name");
			var link = file.getAttribute("data-link");
			var type = file.getAttribute("data-mimetype");
			createTile(name, type, link, "googledrive");
		}
	}
	else{
		console.error("Dialog Index not found for opening files.");
	}
}
function createString(length){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for(var i = 0; i < length; i++){
        text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
    return text;
}
function checkEnter(event){
	if(event.keyCode == 13 || event.which == 13){
		return true;
	}
	else{
		return false;
	}
}




function loadNextImage(){
	if(imageQue.length > 0 && !imageLoading){
		var elem = imageQue[0][0];
		imageLoading = true;
		elem.setAttribute("onload","imageLoading = false;loadNextImage();");
		var src = imageQue[0][1];
		elem.src = src;
		imageQue.shift();
		return true;
	}
	else{
		return false;
	}
}
function queImage(elem, src, callback){
	imageQue.push([elem,src, callback]);
}
function GoogleDialog(id){ //JavaScript class
	var fileSelector = document.createElement("DIV");
	fileSelector.className = "fileSelectorDrive";
	fileSelector.title = "Select File (Google Drive)";
	fileSelector.id = id;
	fileSelector.setAttribute("data-service","googledrive");
	fileSelector.style.backgroundImage="url('images/product128.png')";
	fileSelector.style.backgroundPosition="center center";
	fileSelector.style.backgroundRepeat="no-repeat";
	//Style fileSelector
	fileSelector.setAttribute("onclick","if(checkTarget(event)){deselectAllFiles(event);}");
	document.body.appendChild(fileSelector);
	
	$(fileSelector).dialog({
	"width": ($("body").width() * 0.8),
	"height": ($("body").height() * 0.8),
	"close": function(){
		$(this).remove();
	}
	});
	$(fileSelector).parent().attr("data-tooltip","Select file from Google Drive.");
	//Open Selected Files Button
	var openFiles = document.createElement("BUTTON");
	openFiles.innerHTML = "Open File(s)"
	
	openFiles.setAttribute("onclick","openSelectedFiles(event);");
	$(openFiles).button();
	openFiles.className += " driveOpenFiles";
	fileSelector.parentNode.children[0].children[0].appendChild(openFiles);
	//Search Bar
	var searchBar = document.createElement("INPUT");
	searchBar.type = "text";
	searchBar.className = "fileSearchBar";
	searchBar.setAttribute("onkeypress","if(checkEnter(event)){var dialogIndex = findDialog('"+id+"','googledrive'); openDialogs[dialogIndex].searchFile(this.value);}");
	searchBar.setAttribute("onmousedown","event.stopPropagation();"); //Stops dragging from the searchbar
	searchBar.setAttribute("ondblclick","event.stopPropagation();"); //Stops collapsing from the searchbar
	searchBar.placeholder = "Search for file..."
	fileSelector.parentNode.children[0].children[0].appendChild(searchBar);
	
	var searchButton = document.createElement("BUTTON");
	searchButton.innerHTML = "Search";
	searchButton.setAttribute("onclick","var dialogIndex = findDialog('"+id+"','googledrive'); openDialogs[dialogIndex].searchFile(this.parentNode.children[1].value);");
	$(searchButton).button({
		"icon": "ui-icon-search"
	});
	searchButton.className += " driveSearchButton";
	fileSelector.parentNode.children[0].children[0].appendChild(searchButton);
	
	var upButton = document.createElement("BUTTON");
	upButton.innerHTML = "Go Up A Level";
	upButton.setAttribute("onclick","var dialogIndex = findDialog('"+id+"','googledrive'); openDialogs[dialogIndex].upLevel();");
	$(upButton).button({
		"icon": "ui-icon-arrowreturnthick-1-n",
		"disabled": "true"
	});
	upButton.className += " driveUpButton";
	fileSelector.parentNode.children[0].children[0].appendChild(upButton);
	this.upButton = upButton;
	
	var breadCrumbs = document.createElement("h3");
	breadCrumbs.className = "breadCrumbs";
	this.breadCrumbs = breadCrumbs;
	fileSelector.parentNode.children[0].children[0].appendChild(breadCrumbs);
		fileSelector.parentNode.children[0].children[0].setAttribute("ondblclick","if(checkTarget(event)){toggleDialog(event);}");
		fileSelector.parentNode.children[0].setAttribute("ondblclick","toggleDialog(event);");
	var globalThis = this;
	this.id = id;
	this.file = fileSelector;
	this.open = openFiles;
	this.searchBar = searchBar;
	this.searchButton = searchButton;
	this.fileOptions = [];
	this.fileNames = [];
	this.selectedFiles = [];
	this.currentParent = "";
	this.currentLevel = "root";
	this.path = [["root","root"]]; //2D array of folder names and id's (in that order)
	$(searchBar).autocomplete({
		"source": globalThis.fileNames
	});
	
	this.createGoogleTile = function(fileObj){
		var fileOption = document.createElement("DIV");
		fileOption.setAttribute("data-id",fileObj.id);
		fileOption.setAttribute("data-name",fileObj.name);
		var link = createDriveLink(getFileId(fileObj.webViewLink));
		fileOption.setAttribute("data-link",link);
		if(fileObj.parents != undefined){
			fileOption.setAttribute("data-path",fileObj.parents.join("/"));
		}
		else{
			fileOption.setAttribute("data-path","");
		}
		fileOption.setAttribute("data-mimetype",fileObj.mimeType);
		fileOption.setAttribute("ondrag","event.preventDefault()");
		fileOption.className = "fileOption";

		var fileThumb = document.createElement("IMG");
		fileThumb.className = "fileOptionThumb";
		fileThumb.setAttribute("ondragstart","event.preventDefault();return false;")
		if(typeof fileObj.thumbnailLink !== "undefined"){ //If the thumbnail for the file exists
			fileThumb.src = "images/loading.gif";
			queImage(fileThumb,fileObj.thumbnailLink);
		}
		else{
			switch(fileObj.mimeType){
				case "application/vnd.google-apps.folder": //If its a folder
					fileThumb.src = "images/folder.png";
					fileOption.className += " fileOptionFolder";
					fileOption.setAttribute("ondblclick","var dialogIndex = findDialog('"+id+"','googledrive'); openDialogs[dialogIndex].openFolder('"+fileObj.id+"','"+fileObj.name+"');");

				break;

				default: //If its a file
					fileThumb.src = "images/file.png";
					fileOption.setAttribute("ondblclick","refreshImage(event)");

				break;
			}
		}
		fileThumb.alt = fileObj.name;


		var fileName = document.createElement("H2");
		fileName.className = "fileOptionName";
		fileName.innerHTML = fileObj.name;
		fileOption.onclick = fileClicked;
		fileOption.appendChild(fileThumb);
		fileOption.appendChild(fileName);
		globalThis.file.append(fileOption);
		return fileOption;
	}
	this.handleResponse = function(resp) {
		var files = resp.files;
		if(typeof resp.error === "undefined"){
			console.info(files);
			if (files && files.length > 0) {
				for(var fileNum = 0; fileNum < files.length; fileNum++){
					var file = files[fileNum];
					var newTile = globalThis.createGoogleTile(file);
					globalThis.fileNames.push(file.name); //Create a running list of file names (for search bar)
					globalThis.fileOptions.push(newTile); //Create a running list of the loaded tiles
				}	
				loadNextImage(); //This function is self recurring
			}
		}
		else{
			globalThis.loadError(resp);
		}
	};
	this.loadFileSelections = function(req){
		var request;
		var success = false;
		try{
			request = gapi.client.drive.files.list(req);
			success = true;
		}
		catch(e){
			success = false;
		}
		if(success){
			request.execute(globalThis.handleResponse);
		}
		else{
			var resp = {
				error: true,
				message: "<p class='dialogError'>There was an error loading your Google Drive files. Click here to <a onclick='var dialogIndex = findDialog(\""+id+"\",\"googledrive\"); openDialogs[dialogIndex].clear(); openDialogs[dialogIndex].loadFileSelections(standardRequest);'>refresh the Google Drive dialog.</a></p>"
			}
			globalThis.handleResponse(resp);
		}
	}
	this.updateOpenFileButton = function(numFiles){
		if(globalThis.numFiles == undefined){
			globalThis.numFiles = 0;
		}
		globalThis.open.innerHTML = "Open File(s) - " + String(numFiles) + " Selected"

	}
	this.searchFile = function(query){
		var request = standardRequest;
		request.q = "'root' in parents and name contains '" + query + "'", //Search query
		globalThis.clearFileSelections();
		globalThis.loadFileSelections(request);
	}

	this.clearFileSelections = function(){ //Clears all the files from the file selector dialog
		globalThis.fileNames = [];
		//ID ERROR
		globalThis.file.innerHTML = "";
	}
	this.openFolder = function(folderId, folderName, folderIndex){
		if(typeof folderName !== "undefined"){ //If the folderName parameter is given
			if(typeof folderIndex !== "undefined"){ //Means openFolder() was called by a breadcrumb
				globalThis.path.splice(folderIndex+1,globalThis.path.length-1);
				globalThis.refreshBreadCrumbs();
				
			}
			else{ //If there are only 2 parameters (this happens when going up 1 folder)
				globalThis.path.push([folderName,folderId]);
			}
			
		}
		else{ //This is the case when the path is going up a folder
			globalThis.path.pop();
		}
		globalThis.refreshBreadCrumbs();
		var request = standardRequest;
		request.q = "'"+folderId+"' in parents";
		globalThis.clearFileSelections();
		globalThis.loadFileSelections(request);
		globalThis.currentParent = globalThis.currentLevel;
		globalThis.currentLevel = folderId;
		if(globalThis.currentLevel==="root"){
			$(globalThis.upButton).button("disable");
		}
		else{
			$(globalThis.upButton).button("enable");
		}
	}
	this.upLevel = function(){
		if(globalThis.currentLevel !== "root"){
			globalThis.openFolder(globalThis.currentParent);
			if(globalThis.currentLevel==="root"){
				$(globalThis.upButton).button("disable");
			}
		}
	}
	this.refreshBreadCrumbs = function(){
		globalThis.breadCrumbs.innerHTML = "Google Drive";
		for(var pathNum = 0; pathNum < globalThis.path.length; pathNum++){
			globalThis.breadCrumbs.innerHTML += "/";
			var newLink = document.createElement("A");
			newLink.setAttribute("onclick","var dialogIndex = findDialog('"+id+"','googledrive'); openDialogs[dialogIndex].openFolder('"+globalThis.path[pathNum][1]+"','"+globalThis.path[pathNum][0]+"',"+String(pathNum)+");");
			newLink.innerHTML = globalThis.path[pathNum][0];
			globalThis.breadCrumbs.appendChild(newLink);
			
		}
	}
	this.refreshBreadCrumbs(); //Initialize the breadcrumbs
	this.loadError = function(err){
		globalThis.file.innerHTML = err.message;
	}
	this.clear = function(){
		globalThis.file.innerHTML = "";
	}
}
function findDialog(id, service){
	var index = -1;
	var arrDialogs = false;
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
	for(var dialogNum = 0; dialogNum < arrDialogs.length; dialogNum++){
		if(arrDialogs[dialogNum].id === id){
			index = dialogNum;
		}
	}
    return index;
}

function loadNextImage(){
	if(imageQue.length > 0 && !imageLoading){
		var elem = imageQue[0][0];
		imageLoading = true;
		elem.setAttribute("onload","imageLoading = false;loadNextImage();");
		
		elem.setAttribute("onerror","this.src='images/brokenLink.png';imageLoading = false;loadNextImage();");
		var src = imageQue[0][1];
		elem.src = src;
		elem.alt = src;
		if(typeof imageQue[0][2] !== "undefined"){
			imageQue[0][2]();
		}
		imageQue.shift();
		return true;
	}
	else{
		return false;
  	}
}
function getFileId(url){
	var url = url.split("/");
	var id = url[url.length-2];
	return id;
}
function createDriveLink(id){
	return "https://docs.google.com/viewer?srcid=" + id + "&pid=explorer&efh=false&a=v&chrome=false&embedded=true"; //Credit to Ben Bollard Schersten at http://www.benschersten.com/blog/2014/04/embedding-a-pdf-from-drive-into-a-blog/
}
/*function onSignIn(googleUser){
	console.log("Signed in");
	$(".g-signin2").hide();
	$("#driveLogout").show();
	$("#driveFileSelect").show();
	var profile = googleUser.getBasicProfile();
	console.log("ID: " + profile.getId()); // Do not send to your backend! Use an ID token instead.
	console.log("Name: " + profile.getName());
  	console.log("Image URL: " + profile.getImageUrl());
	console.log("Email: " + profile.getEmail()); // This is null if the "email" scope is not present.
}*/
