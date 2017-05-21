var creditItem = "creditItem"; //The class name of creditItems
var creditImage = "creditImage";
function createList(){
	var contents = document.getElementById("contents");
	for(var elem = 0; elem < document.getElementById("holder").children.length; elem++){
		var children = document.getElementById("holder").children;
		var current = children[elem];
		if(current.tagName === "H1"){
			current.setAttribute("id",current.innerHTML.replace(/ /g,"_"));
			var newHead = document.createElement("h4");
			var newLink = document.createElement("a");
			newLink.href = "#"+current.innerHTML.replace(/ /g,"_");
			newLink.innerHTML = current.innerHTML;
			newHead.appendChild(newLink);
			contents.appendChild(newHead);
		}
		else if(current.className === "creditItem"){
			current.children[0].setAttribute("id",current.children[0].innerHTML.replace(/ /g,"_")); //Set its id to its contents. Spaces are replaced with underscores
			var newHead = document.createElement("h5");
			var newLink = document.createElement("a");
			newLink.href = "#"+current.children[0].innerHTML.replace(/ /g,"_");
			newLink.innerHTML = current.children[0].innerHTML;
			newHead.appendChild(newLink);
			contents.appendChild(newHead);
		}
	}
	for(var h2 = 0; h2 < document.getElementsByTagName("h2").length; h2++){
		
	}
}
function toggleImage(event){
	var targ = event.target;
	if(targ.getAttribute("data-open") === "false"){
		targ.style.maxHeight = "none";
		targ.setAttribute("data-open","true");
	}
	else{
		targ.style.maxHeight = "128px";
		targ.setAttribute("data-open","false");
	}
	
}
function addListeners(){
	for(var elem = 0; elem < document.getElementsByClassName(creditImage).length; elem++){
		var current = document.getElementsByClassName(creditImage)[elem];
		current.setAttribute("data-open","false");
		current.setAttribute("ondblclick","toggleImage(event)");
		current.title = "Double click to enlarge.";
		$(current).tooltip();
	}
}