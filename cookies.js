function initCookie(){
	var url = window.location.href;//Get the url of the window
	//window.location.href = window.location.origin;
	url = url.split("#")[1];
	url = url.split("&")[0];
	url = url.split("=")[1];
	var d = new Date();
	var exdays = 0.5;
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
	//document.cookie = "dropboxToken="+url+"; expires="+d.toUTCString()+";path=http://localhost:8000/index.html";
	window.opener.postMessage("token="+url,"http://localhost:8000/index.html");
	window.open("","_self").close(); //Close this window
}