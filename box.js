function getDropOptions(){
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