// The Browser API key obtained from the Google Developers Console.
// Replace with your own Browser API key, or your own key.
var developerKey = "AIzaSyBJQh81b7ruToo-QkSy_krwqO9ByKhIOM0";

// The Client ID obtained from the Google Developers Console. Replace with your own Client ID.
var CLIENT_ID= "905474582382-5kuikj9l46duojj4flfd3q2e6aogg02v.apps.googleusercontent.com";

// Replace with your own App ID. (Its the first number in your Client ID)
var appId = "905474582382";

// Scope to use to access user's Drive items.
var SCOPES = ["https://www.googleapis.com/auth/drive","https://www.googleapis.com/auth/plus.login","https://www.googleapis.com/auth/plus.me"];


var currentLevel = "root";

var googleInfo = {};

var fileNames = []; //Used for search bar suggestions

var imageQue = [];

var openDialogs = [];

var imageLoading = false;
var dialogStringLength = 5;

var standardRequest = {
	//"pageSize": 10,
	"corpus": "user",
	"spaces": "drive",
	"quotaUser": createString(5),
	"q": "'root' in parents", //Search query
	"orderBy": "name",
	"fields": "files(id, name, iconLink, thumbnailLink, parents, mimeType,webViewLink,webContentLink,trashed)" //Defines the information returned for the files
	//Others include: webViewLink, webContentLink, nextPageToken
 }

function checkAuth() {
	console.log("Checking Google Drive auth...");
gapi.auth.authorize(
	
  {
	"client_id": CLIENT_ID,
	"scope": SCOPES.join(" "),
	"immediate": true
  }, handleAuthResult);
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
function driveLogout(){
	gapi.auth.signOut();
	$("#driveAuth").show();
	$("#driveLogout").hide();
	$("#driveSelectFile").hide();
	$("#driveProfilePic").remove();
	googleInfo = {};
}
function handleAuthResult(authResult) {
	
	if (authResult && !authResult.error) {
	  // Hide auth UI, then load client library.
		console.groupCollapsed("Google Drive successfully authorized.");
		console.log(authResult);
		console.groupEnd();
		$("#driveAuth").hide();
		$("#driveSelectFile").show();
		$("#driveLogout").show();
		

	  	loadDriveApi();
		loadProfileApi();
	} else {
	  // Show auth UI, allowing the user to initiate authorization by
	  // clicking authorize button.
		console.groupCollapsed("Google Drive unsuccessful.");
		console.log(authResult);
		console.groupEnd();
		$("#driveAuth").show();
		$("#driveSelectFile").hide();
		$("#driveLogout").hide();
	}
	
}

function handleAuthClick(event) {
	gapi.auth.authorize({
		client_id: CLIENT_ID, 
		scope: SCOPES, 
		immediate: false},
		handleAuthResult
	);
	return false;
}

function loadProfileApi(){
	gapi.client.load("plus", "v1", initProfile);
}
function loadDriveApi() {
	gapi.client.load("drive", "v3", initDrive);
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
function loadGoogleImage(src){
	var newImg = document.createElement("IMG");
	var originalImg = document.getElementById("driveIcon");
	var holder = document.getElementById("driveTabHolder");
	newImg.className = "tabIcon profileIcon";
	newImg.id = "driveProfilePic";
	newImg.src = src;
	newImg.style.opacity = "0";
	newImg.style.verticalAlign = "top";
	holder.insertBefore(newImg,originalImg);
	$(newImg).animate({"opacity":1});
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
function initDrive(){
	
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
	var batch = gapi.client.newBatch();
	var dialogIndex = findDialog(id);
	if(dialogIndex != -1){
		var selectedFiles = openDialogs[dialogIndex].selectedFiles;
		for(var fileNum in selectedFiles){
			var request = gapi.client.drive.files.get({
				"fileId" : selectedFiles[fileNum][0].getAttribute("data-id"),
				"fields" : "webViewLink,webContentLink,iconLink,thumbnailLink,id,name,mimeType"
			});
			console.info(selectedFiles[fileNum][0].getAttribute("data-id"));
			batch.add(request);

		}
		batch.execute(function(map,response){
			response = JSON.parse(response);
			console.log(response);
			globResponse = response;
			for(var fileNum = 0; fileNum < response.length; fileNum++){ //Go through each file in the batch response
				var file = response[fileNum].result;
				createTile(file.name,file.mimeType,file.webViewLink,"googledrive");
			}
		});
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
function queImage(elem, src){
	imageQue.push([elem,src]);
}
function GoogleDialog(id){ //JavaScript class
	var fileSelector = document.createElement("DIV");
	fileSelector.className = "fileSelectorDrive";
	fileSelector.title = "Select File (Google Drive)";
	fileSelector.id = id;
	//Style fileSelector
	fileSelector.setAttribute("onclick","if(checkTarget(event)){deselectAllFiles(event);}")
	document.body.appendChild(fileSelector);
	
	$(fileSelector).dialog({
	"width": ($("body").width() * 0.8),
	"height": ($("body").height() * 0.8),
	"close": function(){
		$(this).remove();
		driveDialogOpen = false;
	}
	});
	$(fileSelector).parent().attr("data-tooltip","Select file from Google Drive.");
	//Open Selected Files Button
	var openFiles = document.createElement("BUTTON");
	openFiles.innerHTML = "Open File(s)"
	openFiles.class = "driveOpenFiles";
	openFiles.setAttribute("onclick","openSelectedFiles(event);");
	$(openFiles).button();
	fileSelector.parentNode.children[0].children[0].appendChild(openFiles);
	//Search Bar
	var searchBar = document.createElement("INPUT");
	searchBar.type = "text";
	searchBar.className = "fileSearchBar";
	searchBar.setAttribute("onkeypress","if(checkEnter(event)){var dialogIndex = findDialog('"+id+"'); openDialogs[dialogIndex].searchFile(this.value);}");
	searchBar.setAttribute("onmousedown","event.stopPropagation();"); //Stops dragging from the searchbar
	searchBar.placeholder = "Search for file..."
	fileSelector.parentNode.children[0].children[0].appendChild(searchBar);
	
	var searchButton = document.createElement("BUTTON");
//ID ERROR	//searchButton.setAttribute("onclick","searchFile(document.getElementById('fileSearchBar')).value");
	
		fileSelector.parentNode.children[0].setAttribute("ondblclick","if(checkTarget(event)){toggleDialog(event);}");
		fileSelector.parentNode.setAttribute("ondblclick","if(checkTarget(event)){toggleDialog(event);}");
	var globalThis = this;
	this.id = id;
	this.file = fileSelector;
	this.open = openFiles;
	this.searchBar = searchBar;
	this.searchButton = searchButton;
	this.fileOptions = [];
	this.fileNames = [];
	this.selectedFiles = [];
	
	$(searchBar).autocomplete({
		"source": globalThis.fileNames
	});
	
	this.createGoogleTile = function(fileObj){
		var fileOption = document.createElement("DIV");
		fileOption.setAttribute("data-id",fileObj.id);
		fileOption.setAttribute("data-name",fileObj.name);
		fileNames.push(fileObj.name); //Used for search bar suggestions
		if(file.parents != undefined){
			fileOption.setAttribute("data-parents",fileObj.parents.join(","));
		}
		else{
			fileOption.setAttribute("data-parents","");
		}
		fileOption.setAttribute("data-mimetype",fileObj.mimeType);
		fileOption.className = "fileOption";

		var fileThumb = document.createElement("IMG");
		fileThumb.className = "fileOptionThumb";

		if(fileObj.thumbnailLink != undefined){ //If the thumbnail for the file exists
			fileThumb.src = "images/loading.gif";
			queImage(fileThumb,fileObj.thumbnailLink);
		}
		else{
			switch(file.mimeType){
				case "application/vnd.google-apps.folder":
					fileThumb.src = "images/folder.png";
					fileOption.className += " fileOptionFolder";
				break;

				default:
					fileThumb.src = "images/file.png";
				break;
			}
		}
		fileThumb.alt = fileObj.name;


		var fileName = document.createElement("H2");
		fileName.className = "fileOptionName";
		fileName.innerHTML = fileObj.name;
		fileOption.onclick = fileClicked;
		fileOption.ondblclick = openFolder;
		fileOption.appendChild(fileThumb);
		fileOption.appendChild(fileName);
		globalThis.file.append(fileOption);
	}
	this.handleResponse = function(resp) {
		console.log(resp);
		var files = resp.files;
		if (files && files.length > 0) {
			for(var fileNum = 0; fileNum < files.length; fileNum++){
				var file = files[fileNum];
				globalThis.createGoogleTile(file);
				globalThis.fileNames.push(file.name);
			}	
			loadNextImage(); //This function is self recurring
		}
	};
	this.loadFileSelections = function(req){
		var request = gapi.client.drive.files.list(req);
		console.log(req);
		console.log(globalThis);
		request.execute(globalThis.handleResponse);
	}
	this.updateOpenFileButton = function(numFiles){
		if(globalThis.numFiles == undefined){
			globalThis.numFiles = 0;
		}
		globalThis.open.innerHTML = "Open File(s) - " + String(numFiles) + " Selected"

	}
	this.searchFile = function(query){
		var request = {
				//"pageSize": 10,
			"corpus": "user",
			"spaces": "drive",
			"quotaUser": createString(5),
			"q": "'root' in parents and name contains '" + query + "'", //Search query
			"orderBy": "name",
			"fields": "files(id, name, iconLink, thumbnailLink, parents, mimeType,webViewLink,webContentLink,trashed)" //Defines the information returned for the files
			//Others include: webViewLink, webContentLink, nextPageToken
		};
		globalThis.clearFileSelections();
		globalThis.loadFileSelections(request);
	}

	this.clearFileSelections = function(){ //Clears all the files from the file selector dialog
		globalThis.fileNames = [];
		//ID ERROR
		globalThis.file.innerHTML = "";
	}
	
}
function findDialog(id){
	var index = -1;
	for(var dialogNum = 0; dialogNum < openDialogs.length; dialogNum++){
		if(openDialogs[dialogNum].id === id){
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
		elem.setAttribute("onerror","this.src='images/brokenFile.png';imageLoading = false;loadNextImage();");
		var src = imageQue[0][1];
		elem.src = src;
		elem.alt = src;
		imageQue.shift();
		return true;
	}
	else{
		return false;
  	}
}