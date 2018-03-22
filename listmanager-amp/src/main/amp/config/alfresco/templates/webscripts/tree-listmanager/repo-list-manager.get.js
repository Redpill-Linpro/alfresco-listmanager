function main() {
	var prefix = "workspace://SpacesStore/";
	var s = new XML(config.script);
	var nodeRef = url.templateArgs.nodeRef;
	var startNode;
	if (nodeRef == null || nodeRef == "" || nodeRef == "root") {
		startNode = search.selectNodes('workspace://SpacesStore','' + s.listpath + '/cm:' + s.listname +  '')[0];
		if (startNode == null) {
			var listLocation =  search.luceneSearch('workspace://SpacesStore','PATH:"' + s.listpath +  '"')[0];
			startNode = listLocation.createNode(s.listname, "cm:folder");
			startNode.save();
		}
	} else {
		startNode = search.findNode(prefix + nodeRef);
	}
	var result = {};
	if (startNode == null) {
		result.error="No Lists rootNode found";
	} else {
		result.nodeRef = startNode.properties["sys:node-uuid"];
		result.type = "Text";
		result.label = startNode.properties["cm:title"];
		result.children = findChildren(startNode);
	}
	
	model.json = jsonUtils.toJSONString(result);
}

function findChildren(folder) {
  var scriptlist = [];

  var children = folder.children;
	//Sort children according to repo property order
  
  children.sort(function(a,b) {
  	var ai = a.properties["acutil:ordinalNumber"];
  	var bi = b.properties["acutil:ordinalNumber"];
    return ai < bi ? -1 : (ai > bi ? 1 : 0);
  });

 
  for (var c=0;c < children.length; c++) {
    var node = children[c];
	var item = {label : node.properties["cm:title"], editable:true, type: "Text", nodeRef: node.properties["sys:node-uuid"]};
    if (node.children && node.children.length>0) {
		item.isLeaf = false;
	} else {
		item.isLeaf = true;
	}
	scriptlist.push(item);
  }

  return scriptlist;
}



main();
