var appId = "5eyfnab5yv1ei5r";
var clientId = "";
var dropboxInfo = {};
function dropboxInit(){
	$("#dropboxLogout").hide();
	dropbox.setGlobalErrorHandler(function(error){
		console.error(error);
	});
	var localStorageTokenStore = function(key,val){
	  	return (arguments.length > 1) ? (localStorage[key] = val) : localStorage[key];
	}
dropbox.setTokenStore(localStorageTokenStore);
	
}
function dropboxLogin(){
	dropbox.authenticate( 
		{ 
			client_id: appId, 
			redirect_uri: "http://localhost:8000" 
		}, 
		{
			onComplete: function(resp){
				$("#dropboxLogin").hide();
				$("#dropboxLogout").show();
				console.log("Dropbox successfully authorized.");
			}
		} 
	);
	getDropboxInfo(localStorage.__dbat);
}
function dropboxLogout(){
	console.log("Logging out of dropbox...");
	dropboxInfo = {};
	$("#dropboxAuth").show();
	$("#dropboxLogout").hide();
	//https://api.dropboxapi.com/2/auth/token/revoke
	httpPostAsync("https://api.dropboxapi.com/2/auth/token/revoke",function(){},["Authorization","Bearer "+localStorage.__dbat])
	localStorage.__dbat = "";
	
}
function getFolders(){
	dropbox("files/list_folder",/*
			{
		"account_id": localStorage.__dbat
	},*/
			{
		"path":""
	},
			function(resp){
		console.log(resp);
	});
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
			
		}
	},["Authorization","Bearer "+token]);
	
}