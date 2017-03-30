var driveDialogOpen = false;
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

var imageLoading = false;

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
	console.log("checking auth...");
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
	console.log(authResult);
	if (authResult && !authResult.error) {
	  // Hide auth UI, then load client library.
		$("#driveAuth").hide();
		$("#driveSelectFile").show();
		$("#driveLogout").show();
		

	  	loadDriveApi();
		loadProfileApi();
	} else {
	  // Show auth UI, allowing the user to initiate authorization by
	  // clicking authorize button.
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
	if(!driveDialogOpen){
		openDialog();
	}
	loadFileSelections(standardRequest);
}
function searchFile(query){
	if(driveDialogOpen){
		var request = gapi.client.drive.files.list({
			//"pageSize": 10,
			"corpus": "user",
			"spaces": "drive",
			"quotaUser": createString(5),
			"q": "'root' in parents and name contains '" + query + "'", //Search query
			"orderBy": "name",
			"fields": "files(id, name, iconLink, thumbnailLink, parents, mimeType,webViewLink,webContentLink,trashed)" //Defines the information returned for the files
			//Others include: webViewLink, webContentLink, nextPageToken
		});
		clearFileSelections();
		loadFileSelections(request);
	}
	else{
		console.error("searchFile() called whilst dialog is closed");
	}
	
}
function refreshFiles(){
	
}
function initDrive(){
	
}
function updateOpenFileButton(numFiles){
	if(numFiles == undefined){
		numFiles = 0;
	}
	document.getElementById("driveOpenFiles").innerHTML = "Open File(s) - " + String(numFiles) + " Selected"
	
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
function openSelectedFiles(){
	selectedFiles;
	var batch = gapi.client.newBatch();
	
	for(var fileNum in selectedFiles){
		var request = gapi.client.drive.files.get({
			"fileId" : selectedFiles[fileNum][0].getAttribute("data-id"),
			"fields" : "webViewLink,webContentLink,iconLink,thumbnailLink,id,name"
		});
		console.info(selectedFiles[fileNum][0].getAttribute("data-id"));
		/*request.execute(function(resp){
			var name = selectedFiles[fileNum][0].getAttribute("data-name").split(".")[0];
			var fileType = selectedFiles[fileNum][0].getAttribute("data-name").split(".")[1];
			if(resp.thumbnailLink == undefined){
				createTile(name,fileType,resp.webViewLink,"googledrive");
			}
			else{
				createTile(name,fileType,resp.thumbnailLink,"googledrive");
			}
			
		});*/
		batch.add(request);
		
	}
	batch.execute(function(map,response){
		console.log(response);
		
	});
	console.log(batch);
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
function loadFileSelections(req){
	var request = gapi.client.drive.files.list(req);

	request.execute(function(resp) {
		console.log(resp);
		var files = resp.files;
		if (files && files.length > 0 && driveDialogOpen) {
			for(var fileNum = 0; fileNum < files.length; fileNum++){
				var file = files[fileNum];
				createGoogleTile(file);
				 //This function is self recurring
			}	
			loadNextImage();
		}
	});
}
function openDialog(){
	driveDialogOpen = true;
	var fileSelector = document.createElement("DIV");
	fileSelector.id = "fileSelectorDrive";
	fileSelector.title = "Select File (Google Drive)";
	var fileOptions = [];

	document.body.appendChild(fileSelector);

	//Style fileSelector
	document.getElementById("fileSelectorDrive").setAttribute("onclick","if(checkTarget(event)){deselectAllFiles();}")
	$("#fileSelectorDrive").dialog({
	"width": ($("body").width() * 0.8),
	"height": ($("body").height() * 0.8),
	"close": function(){
		$(this).remove();
		driveDialogOpen = false;
	}
	});
	$("#fileSelectorDrive").parent().attr("data-tooltip","Select file from Google Drive.");
	var openFiles = document.createElement("BUTTON");
	openFiles.className = "button";
	openFiles.innerHTML = "Open File(s)"
	openFiles.id = "driveOpenFiles";
	openFiles.onclick = openSelectedFiles;
	document.getElementById("fileSelectorDrive").parentNode.children[0].children[0].appendChild(openFiles);
	var searchBar = document.createElement("INPUT");
	searchBar.type = "text";
	searchBar.id = "fileSearchBar";
	searchBar.setAttribute("onkeypress","if(checkEnter(event)){searchFile(this.value);}");
	searchBar.placeholder = "Search for file..."
	$(searchBar).on("click",function(){
		$(this).focus();
	});
	document.getElementById("fileSelectorDrive").parentNode.children[0].children[0].appendChild(searchBar);
	var searchButton = document.createElement("button");
	searchButton.setAttribute("onclick","searchFile(document.getElementById('fileSearchBar')).value");

	$("#fileSearchBar").autocomplete({
		"source": fileNames
	});
	for(var elem = 0; elem < document.getElementsByClassName("ui-dialog-titlebar").length; elem++){
		document.getElementsByClassName("ui-dialog-titlebar")[elem].children[0].setAttribute("ondblclick","if(checkTarget(event)){toggleDialog(event);}");
		document.getElementsByClassName("ui-dialog-titlebar")[elem].setAttribute("ondblclick","if(checkTarget(event)){toggleDialog(event);}");
	}
	
	
	$( "button" ).button();

}
function clearFileSelections(){ //Clears all the files from the file selector dialog
	if(driveDialogOpen){
		fileNames = [];
		document.getElementById("fileSelectorDrive").innerHTML = "";
	}
	else{
		console.error("clearFileSelctions called whilst dialog is not open")
	}
}
function createGoogleTile(fileObj){
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
	$("#fileSelectorDrive").append(fileOption);
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
function queImage(elem, src){
	imageQue.push([elem,src]);
}