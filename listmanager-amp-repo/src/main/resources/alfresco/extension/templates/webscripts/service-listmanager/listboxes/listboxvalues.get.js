var listboxname=url.templateArgs.listboxname;
var nodes = search.luceneSearch("workspace://SpacesStore","PATH:\"/app:company_home/app:dictionary/cm:Lists/*\"", "@{http://www.acando.com/model/listmanager/1.0}ordinalNumber", true);
var values = [];
for each(var node in nodes){
	if (node.properties["cm:title"] == search.ISO9075Encode(listboxname)){
		values = node.children;
		break;
	}
}
values.sort((function(a,b) { return a.properties["acutil:ordinalNumber"] - b.properties["acutil:ordinalNumber"]  }) );
model.listboxvalues = values;
