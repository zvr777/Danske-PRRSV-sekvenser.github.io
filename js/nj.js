function neighborJoining(sequences, taxa) {
	//Get starting distance matrix
	let distMat = calculateDistMatrix(sequences);
	print_r(distMat);
	let taxaCount	= distMat.length;
	let treeObject = [];
	
	for (let h = 0; h < taxaCount - 2; h++) {
		//Calculate rowsums
		let rowSums = distMat.map(w => w.reduce((x,y) => x + y, 0));
	
		//Calculate the Q matrix fill upper quadrant. Focus on upper triangle, and greedily select first
		let n  = distMat.length;
		let mIndex = [0,1];
		let qMat = Array(n).fill().map(() => Array(n).fill(0));
		for (let i = 0; i < n; i++) {
			for (let j = i + 1; j < n; j++) {
				qMat[i][j] = (n-2)*distMat[i][j]-rowSums[i]-rowSums[j];
				
				//Select minimum index
				if (qMat[i][j] < qMat[mIndex[0]][mIndex[1]]) {
					mIndex[0] = i;
					mIndex[1] = j;
				}
			}
		}
		
		//Calculate branch lengths
		lengthA = 0.5 * distMat[mIndex[0]][mIndex[1]] + (1 / (2 * (n - 2))) * (rowSums[mIndex[0]] - rowSums[mIndex[1]]);
		lengthB = distMat[mIndex[0]][mIndex[1]] - lengthA;
		
		//Recalc branch lengths, copy down (cannot merge the two loops without storing another copy of the array
		for (let i = 0; i < n; i++) {
			distMat[mIndex[0]][i] = 0.5 * (distMat[i][mIndex[0]] + distMat[i][mIndex[1]] - distMat[mIndex[1]][mIndex[0]]);	//Update top half of triangle, maintain bottom for calc
		}
		for (let i = 0; i < n; i++) {
			distMat[i][mIndex[0]] = distMat[mIndex[0]][i];
		}
		
		//Diagnostics
		console.log(taxa[mIndex[0]],lengthA);
		console.log(taxa[mIndex[1]],lengthB);
		
		//Add information to tree object
		let obj = {};
		testString = "`" + h + "(" + taxa[mIndex[0]] + ":" + lengthA + "," + taxa[mIndex[1]] + ":" + lengthB + ")";
		treeObject.push(testString);		
		
		//print_r(distMat);
		
		//Drop out taxa 2 and zero out lengths on taxa 1
		distMat.splice(mIndex[1],1);
		distMat.map(function(arr) {
			return arr.splice(mIndex[1],1);
		});
		taxa.splice(mIndex[1],1);
		taxa[mIndex[0]] = "`"  + h;
	}
	
	//Grab last taxa
	console.log(taxa[1],distMat[0][1]);
	testString = "(" + taxa[0] + ":" + distMat[0][0] + "," + taxa[1] + ":" + distMat[0][1] + ")";
	treeObject.push(testString);		

	return resolveTree(treeObject);
}

function print_r(arr) {
	for (let i = 0; i < arr.length; i++) {
		console.log(arr[i].toString());
	}
}

function resolveTree(stringArray) {
	for ( let i = 0; i < stringArray.length; i++) {
		//If marked, copy over the significant part and past it into another string
		if	(stringArray[i][0] == "`") {
			let startIndex = stringArray[i].indexOf("(");
			internalNode = stringArray[i].substring(0,startIndex );
			branchInfo = stringArray[i].substring(startIndex);

			//Clear out indexing
			stringArray[i] = "";
			stringArray = stringArray.map(item => item.replace(internalNode, branchInfo));
		}
	}
	
	//The result is slightly wrong, adding one zero length branch on the wrong spot
	
	//Take out indexes, return solo
	stringArray = stringArray.filter(item => item);
	return stringArray[0] + ";";
}

function calculateDistMatrix(sequences) {
	//Initialize matrix
	let n  = sequences.length;
	let distMat = Array(n).fill().map(() => Array(n).fill(0));
	
	//Iterate over half, fill symmetrically
	for (let i = 0; i < n; i++) {
		for (let j = i+1; j < n; j++) {
			distMat[i][j] = hammingDistance(sequences[i], sequences[j]);
			distMat[j][i] = distMat[i][j];
		}
	}

	return distMat;
}

function calculateDiffMatrix(sequences) {
	//Initialize matrix
	let n  = sequences.length;
	let distMat = Array(n).fill().map(() => Array(n).fill(0));
	
	//Iterate over half, fill symmetrically
	for (let i = 0; i < n; i++) {
		for (let j = i+1; j < n; j++) {
			distMat[i][j] = (hammingDistance(sequences[i], sequences[j])) / sequences[i].length;
			distMat[j][i] = distMat[i][j];
		}
	}

	return distMat;
}


//https://github.com/trekhleb/javascript-algorithms/blob/master/src/algorithms/string/hamming-distance/hammingDistance.js
function hammingDistance(a, b) {
	if (a.length !== b.length) {
		throw new Error('Strings must be of the same length');
	}
	
	let distance = 0;
	
	for (let i = 0; i < a.length; i += 1) {
		if (a[i] !== b[i]) {
			distance += 1;
		}
	}
	
	return distance;
}
