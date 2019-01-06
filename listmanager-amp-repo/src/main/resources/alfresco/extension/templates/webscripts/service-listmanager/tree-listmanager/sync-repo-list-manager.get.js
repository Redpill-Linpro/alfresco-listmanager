function main() {

	var action = url.templateArgs.action;
	var parentNodeRef =url.templateArgs.parentNodeRef;
	
	
	var prefix = "workspace://SpacesStore/";

	var nodeRef = args["n"];
	var folderName = args["t"];
	var insertionPoint = args["i"];
	var nodeToChange = null;

	var parentNode = search.findNode(prefix + parentNodeRef);

	// need to create a new node first?
	if (action == "addFolder") {
		// Generate a name, we will use the title property for our naming.
		nodeToChange = parentNode.createNode(null, "cm:folder");
		nodeToChange.addAspect("cm:titled");
		nodeToChange.properties["cm:title"]=folderName;
		nodeToChange.save();
		
		if (insertionPoint) {
			nodeToChange.addAspect("acutil:sortable");
			nodeToChange.properties["acutil:ordinalNumber"] = insertionPoint;
		}
		var result = {
				nodeRef: nodeToChange.properties["sys:node-uuid"],
				label:folderName
		}
		reOrder(parentNode,nodeToChange,insertionPoint);
		model.result = jsonUtils.toJSONString(result);
		
		// New items are added last, so no need to resort
		return;
	} else if (action == "changeName") { 
		// just a name change for the selected node
		nodeToChange = search.findNode(prefix + nodeRef);
		nodeToChange.properties["cm:title"] = folderName;
		nodeToChange.save();
		model.result = "OK";
		return;
	} else if (action == "delete") { 
		nodeToChange = search.findNode(prefix + nodeRef);
		nodeToChange.remove();
		model.result = "OK";
	} else if (action == "reorder") {
		nodeToChange = search.findNode(prefix + nodeRef);
		reOrder(parentNode,nodeToChange,insertionPoint);
		model.result = "OK";
	}

	

}
function reOrder(parentNode, nodeToChange,insertionPoint) {
	// Fix ordering
	var children = parentNode.children;

	// First sort children array according to repo property order
	children.sort(function(a, b) {
		// todo: sort by ordinalnumber
		var ai = a.properties["acutil:ordinalNumber"];
		var bi = b.properties["acutil:ordinalNumber"];
		return ai < bi ? -1 : (ai > bi ? 1 : 0);
	});

	var oldIndex = findArrayIndexByNodeRef(children, nodeToChange);
	// remove old entry when it was before
	children.splice(oldIndex, 1);
	// Insert at new position
	children.splice(insertionPoint, 0, nodeToChange);
	// Then simply iterate over array which now have the correct order
	for ( var c = 0; c < children.length; c++) {
		var node = children[c];
		if (!node.hasAspect("acutil:sortable")) {
			node.addAspect("acutil:sortable");
		}
		// They simply get the ordinalnumber of the loop
		node.properties["acutil:ordinalNumber"] = c;
		// finally save changes
		node.save();
	}
	
	
}
function findArrayIndexByNodeRef(arr, targetNode) {
	for ( var i = 0; i < arr.length; i++) {
		logger.log((arr[i].nodeRef + "") + " = " + targetNode.nodeRef + " => "
				+ ((arr[i].nodeRef + "") == (targetNode.nodeRef + "")));

		if ((arr[i].nodeRef + "") == (targetNode.nodeRef + "")) {
			return i;
		}
	}
	return -1;
}

main();
