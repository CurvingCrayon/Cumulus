function sort(array){ //Sorts by score (second value in array)
	var numItems = array.length;
	var swappped = true;
	while(swappped){
		swapped = false;
		var i = 0;
		while(i < last-1){
			if(array[i][1]>array[i+1][1]){
				swap(array[i][1],array[i+1][1]); //YOU WILL NEED TO WRITE THIS ALGORITHM
				swapped = true;
			}
			i++;
		}
		last++;
	}
}