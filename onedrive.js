//Secret: fs0rapTNjYwmmypOdHenx6v
var globalFiles = "empty";
var odOptions = {
	clientId: "1c58d429-5955-486c-84d4-921d08dcfa4d",
	action: "query",
 	multiSelect: true,
  	openInNewWindow: true,
  	advanced: {},
  	success: function(files) { console.log("successful"); console.log(files);},
  	cancel: function() { console.log("cancelled") },
	error: function(e) { console.log("error");console.error(e); }
}
function launchOneDrivePicker(){
    OneDrive.open(odOptions);
}