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

var driveLoadTime = 120;

var currentLevel = "root";

var googleInfo = {};

var fileNames = []; //Used for search bar suggestions

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
	});
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

function createGoogleTile(name,id,viewLink,editLink, iconSrc){ //Deprecated
	var newTile = document.createElement("DIV");
	newTile.className = "tile";
	newTile.setAttribute("title",name)
	var openButton = document.createElement("BUTTON");
	openButton.className = "openFileButton";
	openButton.innerHTML = "<a href='"+editLink+"' target='_blank' >View File</a>";
	newTile.appendChild(openButton);
	document.body.appendChild(newTile);
	console.info("tile created");
}

function updateOpenFileButton(numFiles){
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
	for(var fileNum in selectedFiles){
		var request = gapi.client.drive.files.get({
			"fileId" : selectedFiles[fileNum][0].getAttribute("data-id"),
			"fields" : "webViewLink,webContentLink,iconLink,thumbnailLink"
		});
		request.execute(function(resp){
			var name = selectedFiles[fileNum][0].getAttribute("data-name").split(".")[0];
			var fileType = selectedFiles[fileNum][0].getAttribute("data-name").split(".")[1];
			if(resp.thumbnailLink == undefined){
				createTile(name,fileType,resp.webViewLink,"googledrive");
			}
			else{
				createTile(name,fileType,resp.thumbnailLink,"googledrive");
			}
			
		});
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
function loadFileSelections(req){
	var request = gapi.client.drive.files.list(req);

	request.execute(function(resp) {
		console.log(resp);
		var files = resp.files;
		if (files && files.length > 0 && driveDialogOpen) {
			//Start loading options
			var counter = 0;
		
			var intervalTicket = setInterval(function(){
			if(counter < files.length){
				var file = files[counter];
				//Preload any folders
				var folder = true;
				while(folder && counter < files.length){
					file = files[counter];
					if(file.mimeType === "application/vnd.google-apps.folder"){
						var fileOption = document.createElement("DIV");
						fileOption.setAttribute("data-id",file.id);
						fileOption.setAttribute("data-name",file.name);
						fileNames.push(file.name); //Used for search bar suggestions
						if(file.parents != undefined){
							fileOption.setAttribute("data-parents",file.parents.join(","));
						}
						else{
							fileOption.setAttribute("data-parents","");
						}
						fileOption.setAttribute("data-mimetype",file.mimeType);
						fileOption.className = "fileOption";

						var fileThumb = document.createElement("IMG");
						fileThumb.className = "fileOptionThumb";
						if(file.thumbnailLink != undefined){ //Thumbnail for the file exists
							fileThumb.src = file.thumbnailLink;
						}
						else{
							switch(file.mimeType){
								case "application/vnd.google-apps.folder":
									fileThumb.src = "images/folder.png";
									fileOption.className += " fileOptionFolder";
								break;
							}
						}
						fileThumb.alt = file.name;

						var fileName = document.createElement("H2");
						fileName.className = "fileOptionName";
						fileName.innerHTML = file.name;
						fileOption.onclick = fileClicked;
						fileOption.ondblclick = openFolder;
						fileOption.appendChild(fileThumb);
						fileOption.appendChild(fileName);
						$("#fileSelectorDrive").append(fileOption);
						
						counter++;
					}
					else{
						folder = false;
					}
				}
				if(counter < files.length){
					file = files[counter];
					var fileOption = document.createElement("DIV");
					fileOption.setAttribute("data-id",file.id);
					fileOption.setAttribute("data-name",file.name);
					fileNames.push(file.name); //Used for search bar suggestions
					if(file.parents != undefined){
						fileOption.setAttribute("data-parents",file.parents.join(","));
					}
					else{
						fileOption.setAttribute("data-parents","");
					}
					
					fileOption.setAttribute("data-mimetype",file.mimeType);
					fileOption.className = "fileOption";

					var fileThumb = document.createElement("IMG");
					fileThumb.className = "fileOptionThumb";
					if(file.thumbnailLink != undefined){ //Thumbnail for the file exists
						fileThumb.src = file.thumbnailLink;
					}
					else{
						switch(file.mimeType){
							case "application/vnd.google-apps.folder":
								fileThumb.src = "images/folder.png";
								fileOption.className += "fileOptionFolder";
							break;
						}
					}
					fileThumb.alt = file.name;

					var fileName = document.createElement("H2");
					fileName.className = "fileOptionName";
					fileName.innerHTML = file.name;
					
					fileOption.onclick = fileClicked;
					fileOption.ondblclick = openFolder;
					fileOption.appendChild(fileThumb);
					fileOption.appendChild(fileName);
					
					$("#fileSelectorDrive").append(fileOption);
					//$("body").data("id").on("click",fileClicked);
					//$("body").data("id").on("dblclick",openFolder);

					counter++;
				}
				else{
					clearInterval(intervalTicket);
				}
			}
			else{
				clearInterval(intervalTicket);
			}
		},driveLoadTime);
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
	document.getElementById("fileSelectorDrive").setAttribute("onclick","checkTarget(event,deselectAllFiles);")
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
	$(".ui-dialog-titlebar").on({
		"dblclick": toggleDialog
	});
	$( "button" ).button();

}
function clearFileSelections(){ //Clears all the files from the file selector dialog
	if(driveDialogOpen){
		fileNames = [];
		document.getElementById("fileSelectorDrive").innerHTML = "";
	}
	else{
		console.error("clearFileSeelctions called whilst dialog is not open")
	}
}