var appId = "5eyfnab5yv1ei5r";
var clientId = "";
var token = "";
var dropboxInfo = {}; //The user's dropbox account info
var dropboxWindow = false; //The dropbox login window object
var openDropboxDialogs = [];
var allocatedLinks = []; 
function dropboxInit(){
	window.addEventListener("message",receiveMessage,false)
	$("#dropboxLogout").hide();
	$("#dropboxSelectFile").hide();
	dropbox.setGlobalErrorHandler(function(error){
		console.error(error);
	});
	var localStorageTokenStore = function(key,val){
	  	return (arguments.length > 1) ? (localStorage[key] = val) : localStorage[key];
	}
dropbox.setTokenStore(localStorageTokenStore);
	checkForToken();
}
function dropboxLogin(){
	if(dropboxWindow!= false){
		dropboxWindow.close();
	}
	var authObject ={
		"client_id": appId,
		"redirect_uri": "http://localhost:8000/cookie.html",
		"response_type": "token"
	}
	var url = buildUrl("https://www.dropbox.com/oauth2/authorize",authObject);
	dropboxWindow = window.open(url,"_blank","scrollbars=1,left=500,top=100,height=500,width=800");
		//dropbox.authenticate({"client_id":appId,"redirect_uri":"http://localhost:8000"});
}
function dropboxLogout(){
	console.log("Logging out of dropbox...");
	dropboxInfo = {};
	$("#dropboxLogin").show();
	$("#dropboxSelectFile").hide();
	$("#dropboxLogout").hide();
	$("#dropboxTab").css(inactiveTabStyle());
	httpPostAsync("https://api.dropboxapi.com/2/auth/token/revoke",function(){},["Authorization","Bearer "+ token])
	token = "";
	localStorage.dropboxToken = "";
	
}
function previewDropboxFiles(){
	var dialog = createDropboxDialog();
	dialog.loadFileSelections("");
}

function getDropboxOptions(){
	return {
		success: displayDropboxFiles,
		cancel: function() {

		},
		linkType: "preview", // "preview" or "direct"
		multiselect: true,
	}
} 
function displayDropboxFiles(files){
	for(var fileIndex in files){ //Go through all the files selected by the user
		var fileName = files[fileIndex].name.split(".")[0];
		var fileType = files[fileIndex].name.split(".")[1];
		createTile(fileName,fileType,files[fileIndex].link,"dropbox");
		console.log(files[fileIndex].thumbnailLink);
	}
}
function getDropboxInfo(token){
	httpPostAsync("https://api.dropboxapi.com/2/users/get_current_account",function(resp){
		if(resp != false){
			resp = JSON.parse(resp);
			console.groupCollapsed("Dropbox account info found.");
			console.log(resp);
			console.groupEnd();
			clientId = resp.account_id;
			dropboxInfo.clientId = resp.account_id;
			dropboxInfo.name = resp.name.given_name;
			dropboxInfo.nickname = resp.name.familiar_name;
			dropboxInfo.surname = resp.name.surname;
			dropboxInfo.displayName = resp.name.display_name;
			dropboxInfo.email = resp.email;
			if(typeof resp.profile_photo_url !== "undefined"){
				dropboxInfo.photo = resp.profile_photo_url;
				loadDropboxImage(dropboxInfo.photo);
			}
			$("#dropboxSelectFile").button("enable");
			$("#dropboxLogin").hide();
			$("#dropboxLogout").show();
			$("#dropboxSelectFile").show();
			$("#dropboxTab").css(activeTabStyle());
			
		}
	},["Authorization","Bearer "+token]);
	
}
function buildUrl(base,params){
	var newUrl = base+"?";
	for (var param in params) {
		if (params.hasOwnProperty(param)) {
			newUrl += param + "=" + params[param] + "&";
		}
	}
	newUrl = newUrl.slice(0,-1); //Remove last "&" from end of url
	newUrl = encodeURI(newUrl); //Encode any symbols for a URI
	return newUrl;
}
function receiveMessage(event){
	var origin = event.origin || event.originalEvent.origin;
	if(origin === "http://localhost:8000"){
		var msg = event.data;
		token = msg.split("=")[1];
		getDropboxInfo(token);
		localStorage.dropboxToken = token;
	}
}
function checkForToken(){
	if(localStorage.dropboxToken != undefined && localStorage.dropboxToken !== ""){
		token = localStorage.dropboxToken;
		getDropboxInfo(token);
	}
}
function DropboxDialog(id){
	var fileSelector = document.createElement("DIV");
	fileSelector.className = "fileSelectorDropbox";
	fileSelector.title = "Select File (Dropbox)";
	fileSelector.id = id;
	fileSelector.setAttribute("data-service","dropbox")
	fileSelector.style.backgroundImage="url('images/drop.png')"; //Add background image and style
	fileSelector.style.backgroundPosition="center center";
	fileSelector.style.backgroundRepeat="no-repeat";
	//Style fileSelector
	fileSelector.setAttribute("onclick","if(checkTarget(event)){deselectAllFiles(event);}")
	document.body.appendChild(fileSelector);
	
	$(fileSelector).dialog({
	"width": ($("body").width() * 0.8),
	"height": ($("body").height() * 0.8),
	"close": function(){
		$(this).remove();
	}
	});
	$(fileSelector).parent().attr("data-tooltip","Select file from Dropbox.");
	//Open Selected Files Button
	var openFiles = document.createElement("BUTTON");
	openFiles.innerHTML = "Open File(s)"
	openFiles.class = "dropboxOpenFiles";
	openFiles.setAttribute("onclick","openSelectedDropboxFiles(event);");
	$(openFiles).button();
	fileSelector.parentNode.children[0].children[0].appendChild(openFiles);
	//Search Bar
	var searchBar = document.createElement("INPUT");
	searchBar.type = "text";
	searchBar.className = "fileSearchBar";
	searchBar.setAttribute("onkeypress","if(checkEnter(event)){var dialogIndex = findDialog('"+id+"',dropbox); openDialogs[dialogIndex].searchFile(this.value);}");
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
	
	this.createDropboxTile = function(fileObj){
		var fileOption = document.createElement("DIV");
		fileOption.setAttribute("data-id",fileObj.id);
		fileOption.setAttribute("data-link",fileObj.viewLink);
		if(fileObj.linkExpiry === ""){
			fileOption.setAttribute("data-linkExpiry","");
		}
		else{
			fileOption.setAttribute("data-linkExpiry",String(fileObj.linkExpiry.valueOf()));
		}
		
		globalThis.fileNames.push(fileObj.name); //Used for search bar suggestions
		fileOption.setAttribute("data-path",fileObj.path_lower);
		fileOption.className = "fileOption";
		var fileName = fileObj.name;
		if(fileObj[".tag"] === "folder"){
			fileOption.setAttribute("data-mimetype","folder");
			fileOption.className += " fileOptionFolder";
		}
		else{
			fileOption.setAttribute("data-mimetype",fileName.split(".")[fileName.split(".").length-1]);

		}
		fileOption.setAttribute("data-name",fileName.split(".")[0]);

		var fileThumb = document.createElement("IMG");
		fileThumb.className = "fileOptionThumb";
/*		if(fileObj[".tag"] === "folder"){
			fileThumb.src = "images/folder.png";
		}
		else{
			fileThumb.src = "images/file.png";
		}*/
		
		//fileThumb.src = "images/loading.gif";
		//queImage(fileThumb,fileObj.thumbnailLink);
		switch(fileObj[".tag"]){
			case "folder":
				fileThumb.src = "images/folder.png";
				fileOption.className += " fileOptionFolder";
			break;

			default:
				fileThumb.src = "images/file.png";
			break;
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
		var files = resp.entries;
		for(var fileNum = 0; fileNum < files.length; fileNum++){
			if(files[fileNum][".tag"] !== "folder"){
				var path = resp.entries[fileNum].path_lower;
				dropbox("files/get_temporary_link",{"path":path},function(resp){
					resp.metadata.viewLink = resp.link;
					var expiryTime = new Date();
					expiryTime.setTime(expiryTime.valueOf() + 12600000);
					console.info(expiryTime);
					resp.metadata.linkExpiry = expiryTime;
					globalThis.createDropboxTile(resp.metadata);
				});
			}
			else{
				files[fileNum].viewLink = "";
				files[fileNum].linkExpiry = "";
				globalThis.createDropboxTile(files[fileNum]);	
			}
		}
	};
	this.loadFileSelections = function(path){
		dropbox("files/list_folder",
			{
				"path":path
			},
			globalThis.handleResponse
		);
	}
	this.updateOpenFileButton = function(numFiles){
		if(globalThis.numFiles == undefined){
			globalThis.numFiles = 0;
		}
		globalThis.open.innerHTML = "Open File(s) - " + String(numFiles) + " Selected"

	}
	this.searchFile = function(query){
	
	}

	this.clearFileSelections = function(){ //Clears all the files from the file selector dialog
		globalThis.fileNames = [];
		globalThis.file.innerHTML = "";
	}
	
}
function createDropboxDialog(){
	var rand = createString(dialogStringLength);
	var dialog = new DropboxDialog(rand); //Each dialog is given their own random id
	openDropboxDialogs.push(dialog);
	return dialog;
}
function loadDropboxImage(src){
	var newImg = document.createElement("IMG");
	var originalImg = document.getElementById("dropboxIcon");
	var holder = document.getElementById("dropboxTabHolder");
	newImg.className = "tabIcon profileIcon";
	newImg.id = "dropboxProfilePic";
	newImg.style.opacity = "0";
	newImg.style.verticalAlign = "top";
	holder.insertBefore(newImg,originalImg);
	queImage(newImg, src, function(){
		//setTimeout(function(){$(newImg).animate({"opacity":1});},1000);
		$(newImg).animate({"opacity":1});
	});
	loadNextImage();
}
function openSelectedDropboxFiles(event){
	var elem = event.currentTarget;
	var id = elem.parentNode.parentNode.parentNode.children[1].getAttribute("id");
	var service = elem.parentNode.parentNode.parentNode.children[1].getAttribute("data-service");
	var dialogIndex = findDialog(id,service);
	if(dialogIndex != -1){ //If the dailog box is found
		var selectedFiles = openDropboxDialogs[dialogIndex].selectedFiles;
		for(var fileNum in selectedFiles){
			//selectedFiles[fileNum][0].getAttribute("data-id")
			var file = selectedFiles[fileNum][0];
			console.info(file);
			var name = file.getAttribute("data-name");
			var type = file.getAttribute("data-mimetype");
			var expiry = file.getAttribute("data-linkExpiry");
			var time = new Date();
			var expiry = new Date(Number(expiry));
			console.info(expiry);
			console.info(time);
			var link = "";
			if(time < expiry){
				link = file.getAttribute("data-link");
			}
			else{
				console.error("Outdated dropbox link");
			}
			
			//createTile(name,type,link,"dropbox");
			createTile(name,type,"","dropbox");
		}
	}
	else{
		console.error("Dialog Index not found for opening files.");
	}
}