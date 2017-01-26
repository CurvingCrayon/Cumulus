var driveDialogOpen = false;
// The Browser API key obtained from the Google Developers Console.
// Replace with your own Browser API key, or your own key.
var developerKey = 'AIzaSyBJQh81b7ruToo-QkSy_krwqO9ByKhIOM0';

// The Client ID obtained from the Google Developers Console. Replace with your own Client ID.
var CLIENT_ID= "905474582382-5kuikj9l46duojj4flfd3q2e6aogg02v.apps.googleusercontent.com";

// Replace with your own App ID. (Its the first number in your Client ID)
var appId = "905474582382";

// Scope to use to access user's Drive items.
var SCOPES = ['https://www.googleapis.com/auth/drive'];

var driveLoadTime = 2000;

/**
* Check if current user has authorized this application.
*/
//Test comment
function checkAuth() {
	console.log("checking auth...");
gapi.auth.authorize(
	
  {
	'client_id': CLIENT_ID,
	'scope': SCOPES.join(' '),
	'immediate': true
  }, handleAuthResult);
}

/**
* Handle response from authorization server.
*
* @param {Object} authResult Authorization result.
*/
function handleAuthResult(authResult) {
	console.log(authResult);
if (authResult && !authResult.error) {
  // Hide auth UI, then load client library.
  	$("#driveAuth").hide();
	$("#driveLogout").show();
	
  loadDriveApi();
} else {
  // Show auth UI, allowing the user to initiate authorization by
  // clicking authorize button.
  	$("#driveAuth").show();
	$("#driveLogout").hide();
}
}

/**
* Initiate auth flow in response to user clicking authorize button.
*
* @param {Event} event Button click event.
*/
function handleAuthClick(event) {
	gapi.auth.authorize({
		client_id: CLIENT_ID, 
		scope: SCOPES, 
		immediate: false},
		handleAuthResult
	);
	return false;
}

/**
* Load Drive API client library.
*/
function loadDriveApi() {
	gapi.client.load('drive', 'v3', initDrive);
}

/**
* Print files.
*/
function previewDriveFiles() {
var request = gapi.client.drive.files.list({
	//"pageSize": 10,
	"corpus": "user",
	"spaces": "drive",
	"q": "'root' in parents", //Search query
	"orderBy": "name",
	"fields": "files(id, name, iconLink, thumbnailLink, parents, mimeType,webViewLink,webContentLink,trashed)" //Defines the information returned for the files
	//Others include: webViewLink, webContentLink, nextPageToken
  });

request.execute(function(resp) {
	var files = resp.files;
	if (files && files.length > 0 && !driveDialogOpen) {
		driveDialogOpen = true;
		var fileSelector = document.createElement("DIV");
		fileSelector.id = "fileSelectorDrive";
		fileSelector.title = "Select File (Google Drive)";
		var fileOptions = [];
		for (var i = 0; i < files.length; i++) {
			
	  	}
		
		document.body.appendChild(fileSelector);
		
		//Style fileSelector
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
		openFiles.id = "driveOpenFiles";	document.getElementById("fileSelectorDrive").parentElement.children[0].children[0].appendChild(openFiles);
		$(".ui-dialog-titlebar").on({
			"dblclick": toggleDialog
		});
		$( "button" ).button();
		
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
						console.log("folder found");
						var fileOption = document.createElement("DIV");
						fileOption.setAttribute("data-id",file.id);
						fileOption.setAttribute("data-parents",file.parents.join(","));
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
						fileOption.ondblclickclick = openFolder;
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
					fileOption.setAttribute("data-parents",file.parents.join(","));
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
					fileOption.ondblclickclick = openFolder;
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

/**
* Append a pre element to the body containing the given message
* as its text node.
*
* @param {string} message Text to be placed in pre element.
*/
function initDrive(){
	
}

function createGoogleTile(name,id,viewLink,editLink, iconSrc){
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
/*var picker = new google.picker.PickerBuilder().
    addView(google.picker.ViewId.IMAGE_SEARCH).
    setCallback(pickerCallback).
    build();
picker.setVisible(true);*/
function updateOpenFileButton(numFiles){
	document.getElementById("driveOpenFiles").innerHTML = "Open Files - " + String(numFiles) + " Selected"
	
}