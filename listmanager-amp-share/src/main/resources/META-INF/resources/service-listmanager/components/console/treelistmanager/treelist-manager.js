// Ensure Acando namespace exists
if (typeof Acando == "undefined" || !Acando)
{
    var Acando = {};
}
(function() // Function closure
{
	var Dom = YAHOO.util.Dom;
	var Event = YAHOO.util.Event;
	var DDM = YAHOO.util.DragDropMgr;
	
	 var $html = Alfresco.util.encodeHTML,
     $combine = Alfresco.util.combinePaths;
	 
	Acando.TreeListManager = function(htmlId) // Component constructor
    {
        /* Give instance a name and call the superclass constructor */
        this.name = "Acando.TreeListManager";
        this.id = htmlId;
        this.oTextNodeMap = {};
        
        Acando.TreeListManager.superclass.constructor.call(this, htmlId);

        /* Register this component */
        Alfresco.util.ComponentManager.register(this);

        /* Load required YUI Components */
        Alfresco.util.YUILoaderHelper.require(["button", "container", "datasource", "datatable", "json", "history", "treeview"], this.onComponentsLoaded, this);

        /* Define panel handlers */

        var parent = this; // Cached reference to object since 'this' may refer to something else in handler functions

        // NOTE: the panel registered first is considered the "default" view and is displayed first

        /* Form Panel Handler */
        FormPanelHandler = function FormPanelHandler_constructor() // 'form' panel constructor
        {
            FormPanelHandler.superclass.constructor.call(this, "form");
        };

        YAHOO.extend(FormPanelHandler, Alfresco.ConsolePanelHandler, // Extend Alfresco.ConsolePanelHandler
        {
            /**
             * Called by the ConsolePanelHandler when this panel shall be loaded
             *
             * @method onLoad
             */
            onLoad: function onLoad() // Fired on initial panel load
            {
               
            }
        });
        new FormPanelHandler(); // Instantiate panel instance

        // Drag and drop
        //=====================================================
        Acando.TreeListManager.DDList = function(id, sGroup, config, TMGR) {

			Acando.TreeListManager.DDList.superclass.constructor.call(this, id, sGroup, config);

			this.logger = this.logger || YAHOO;
			var el = this.getDragEl();
			Dom.setStyle(el, "opacity", 0.67); // The proxy is slightly transparent
			this.TMGR = TMGR;
			this.goingUp = false;
			this.lastY = 0;
			//lock x-axis movement
			this.setXConstraint(0,0);
			
		};
	       
           
           YAHOO.extend(Acando.TreeListManager.DDList, YAHOO.util.DDProxy, {

			startDrag: function(x, y) {

				// make the proxy look like the source element
				var dragEl = this.getDragEl();
				var clickEl = this.getEl();
				Dom.setStyle(clickEl, "visibility", "hidden");

				dragEl.innerHTML = clickEl.innerHTML;

				Dom.setStyle(dragEl, "color", Dom.getStyle(clickEl, "color"));
				Dom.setStyle(dragEl, "backgroundColor", Dom.getStyle(clickEl, "backgroundColor"));
				Dom.setStyle(dragEl, "border", "2px solid gray");
			},

			endDrag: function(e) {

				var srcEl = this.getEl();
				var proxy = this.getDragEl();
				var legalMove = false;
				var node = this.TMGR.widgets.treeview.getNodeByElement(srcEl);
				
				if (this.lastDestId!=null) {
					var droppedOnNode = this.TMGR.oTextNodeMap[this.lastDestId];
					if (droppedOnNode.parent === node.parent) {
						legalMove = true;
					}
				}
				
				// Show the proxy element and animate it to the src element's location
				Dom.setStyle(proxy, "visibility", "");
				var a = new YAHOO.util.Motion( 
					proxy, { 
						points: { 
							to: Dom.getXY(srcEl)
						}
					}, 
					0.2, 
					YAHOO.util.Easing.easeOut);
				
				var proxyid = proxy.id;
				var thisid = this.id;

				
				
				//Find new ordinal number
				var newOrdinal = 0;
				var el = srcEl.previousSibling;
				while(el!==null) {
					el = el.previousSibling;
					newOrdinal++;
				}
				
				// Hide the proxy and show the source element when finished with the animation
				a.onComplete.subscribe(function() {
						Dom.setStyle(proxyid, "visibility", "hidden");
						Dom.setStyle(thisid, "visibility", "");
					});
				a.animate();
				
				
				//Save reordering change
				if (legalMove) {
		        	var actionCallback = {
			                success: function(o) {
			                		var parent = this.parent;
			                		this.tree.removeChildren(parent,true);
			                		parent.expand();

								   
			                },
			                failure: function(o) {
			                    alert("failure:" + o);
			                },
			                scope:node
			             };
			
		        														
			             var actionUrl = Alfresco.constants.PROXY_URI + "acando/console/sync-treelist-manager/" + node.parent.data.nodeRef + "/reorder/?n=" + node.data.nodeRef  + "&t=" + node.label + "&i="+ newOrdinal;
			             var transaction = YAHOO.util.Connect.asyncRequest('GET', actionUrl,actionCallback, null);
			             Dom.setStyle(node.contentElId, "opacity", 0.30);
				}
			},

			onDragDrop: function(e, id) {

				// If there is one drop interaction, the li was dropped either on the list,
				// or it was dropped on the current location of the source element.
				if (DDM.interactionInfo.drop.length === 1) {

					// The position of the cursor at the time of the drop (YAHOO.util.Point)
					var pt = DDM.interactionInfo.point; 

					// The region occupied by the source element at the time of the drop
					var region = DDM.interactionInfo.sourceRegion; 

					// Check to see if we are over the source element's location.  We will
					// append to the bottom of the list once we are sure it was a drop in
					// the negative space (the area of the list without any list items)
					if (!region.intersect(pt)) {
						var destEl = Dom.get(id);
						var destDD = DDM.getDDById(id);
						destEl.appendChild(this.getEl());
						destDD.isEmpty = false;
						DDM.refreshCache();
					}

				}
			},

			onDrag: function(e) {

				// Keep track of the direction of the drag for use during onDragOver
				var y = Event.getPageY(e);

				if (y < this.lastY) {
					this.goingUp = true;
				} else if (y > this.lastY) {
					this.goingUp = false;
				}

				this.lastY = y;
			},

			onDragOver : function(e, id) {
				var srcEl = this.getEl();
				var destEl = Dom.get(id);
				
				// We are only concerned with menu items, we ignore the
				// dragover
				// notifications for anything else.
				
				if (destEl.id.match(/^ygtv[0-9]+$/)) {
					var p = destEl.parentNode;
					var destIdx = destEl.id.match(/[0-9]+$/);
					var destTreeNode = this.TMGR.oTextNodeMap['ygtv' + destIdx];
					var node = this.TMGR.widgets.treeview.getNodeByElement(srcEl);
					this.lastDestId = destEl.id;
					// Ignore any parent that is expanded
					// If !expanded
					if (!destTreeNode.expanded) {
						if (this.goingUp) {
							p.insertBefore(srcEl, destEl); // insert above
							this.lastDestId = destEl.id;
						} else {
							p.insertBefore(srcEl, destEl.nextSibling); // insert
							// below
							this.lastDestId = destEl.id;
						}
					}
					DDM.refreshCache();
					
				}
				
			}

		});        
        // ======================================================
        return this;
    };

    YAHOO.extend(Acando.TreeListManager, Alfresco.ConsoleTool,
    {
    	treeWidgetContainer : "",
        /**
         * Object container for initialization options
         *
         * @property options
         * @type object
         */
        options: // Console component configurable options
        {
        },

        /**
         * Fired by YUI when parent element is available for scripting.
         * Component initialisation, including instantiation of YUI widgets and event listener binding.
         *
         * @method onReady
         */
        onReady: function TreeListManager_onReady() // Fired when component ready
        {
            // Call super-class onReady() method
            Acando.TreeListManager.superclass.onReady.call(this);
            this.treeWidgetContainer = Dom.get(this.id + "-treewidget");
            this._buildTree();
            this.widgets.treeview.subscribe('dblClickEvent',this._onEventEditNode);
            this.widgets.treeview.subscribe('editorSaveEvent',this._editorSaveEvent);
            this.widgets.treeview.subscribe('editorCancelEvent',this._editorCancelEvent);
           
            //Setup DnD target
            new YAHOO.util.DDTarget(this.widgets.treeview);
            this._setupContextMenu();
        },
        
        _setupContextMenu: function() {
        	
        	this._onTriggerContextMenu =  function (eventType,event) {

                var oTarget = event[0].target;
              
                /*
                     Get the TextNode instance that that triggered the
                     display of the ContextMenu instance.
                */

                var oCurrentTextNode = this.cfg.initialConfig.tree.widgets.treeview.getNodeByElement(oTarget);

                if (!oCurrentTextNode) {
                    // Cancel the display of the ContextMenu instance.

                    this.cancel();
                    this.cfg.initialConfig.tree.oCurrentTextNode = null;

                } else {
                	this.cfg.initialConfig.tree.oCurrentTextNode = oCurrentTextNode;
                	oCurrentTextNode.highlight();
                }

            };

       
            this.addNode = function (eventType, event, scope) {
					if (this.oCurrentTextNode) {
						
						var getIndex = function(n) {
							var index = 0;
							while (n) {
								n = n.previousSibling;
								index++;
							}
							return index;
						}
						//Dont allow add on nodes that are leafs
						if (this.oCurrentTextNode.depth>1) {
							this.oCurrentTextNode = this.oCurrentTextNode.parent;
						}
						var insertionPoint = this.oCurrentTextNode.children.length;// getIndex(this.oCurrentTextNode);
						
						
						
						var nodeData =  {
								label: "new item",
								nodeRef:null,
							    isLeaf : true,
							    labelStyle: "",
						        type : "text",
						        children: [],
						        editable:true
						};
						var oChildNode = this.buildTreeNode(nodeData, this.oCurrentTextNode, false);
						this.oCurrentTextNode.isLeaf = false;
						this.oCurrentTextNode.refresh();
						this.oCurrentTextNode.expand();
						
						oChildNode.data.newOrdinal = insertionPoint;
						oChildNode.editNode();
						
					}
				};
            
           this.deleteNode = function (eventType,event,scope) {
        	   var actionCallback = {
		                success: function(o) {
		                	//var results = YAHOO.lang.JSON.parse(o.responseText)
		                	var theParent = this.oCurrentTextNode.parent;
		                	this.widgets.treeview.removeChildren(theParent);
		                	theParent.expand();
		                	this.oCurrentTextNode = null;

		                },
		                failure: function(o) {
		                    alert("failure:" + o);
		                },
		                scope:this
		             };
        	   var scope = this;
        	   var handleDeleteConfirmed = function() {
        		   	
        		   	 this.hide();
		             var actionUrl = Alfresco.constants.PROXY_URI + "acando/console/sync-treelist-manager/" + scope.oCurrentTextNode.data.nodeRef + "/delete/?n=" + scope.oCurrentTextNode.data.nodeRef;
		             var transaction = YAHOO.util.Connect.asyncRequest('GET', actionUrl,actionCallback, null);
        	   }
        	   
        	   if (this.oCurrentTextNode.depth>1) {
        		   var actionUrl = Alfresco.constants.PROXY_URI + "acando/console/sync-treelist-manager/" + this.oCurrentTextNode.data.nodeRef + "/delete/?n=" + this.oCurrentTextNode.data.nodeRef;
		           var transaction = YAHOO.util.Connect.asyncRequest('GET', actionUrl,actionCallback, null);
        	   } else {
        		   //Get confirmation of delete on entire list
	        	   if (this.confirmDialog == null) {
	        		   this.confirmDialog = new YAHOO.widget.SimpleDialog("simpledialog1", 
	        					 { width: "300px",
	        					   fixedcenter: true,
	        					   visible: false,
	        					   draggable: false,
	        					   close: true,
	        					   modal:true,
	        					   scope:this,
	        					   
	        					  
	        					   icon: YAHOO.widget.SimpleDialog.ICON_WARN,
	        					   constraintoviewport: true,
	        					   buttons: [ { text:"Yes", handler:handleDeleteConfirmed,  scope:this, isDefault:true },
	        								  { text:"No",  handler:function() {this.hide()}, } ]
	        					 } );
	        		   this.confirmDialog.setHeader(this.msg("confirm.delete.header"));
	        		   this.confirmDialog.setBody(this.msg("confirm.delete.text"));
	        		   
	        		   this.confirmDialog.render(this.treeWidgetContainer);
	        	   }
	        	   this.confirmDialog.show();
        	   }
						
			};
			
            var oContextMenu = new YAHOO.widget.ContextMenu(
                "mytreecontextmenu",
                {
                    trigger:this.treeWidgetContainer,
                    lazyload: true,
                    tree: this,
                    itemdata: [
                        { text: this.msg("context.menu.insert.item"), onclick: { fn: this.addNode, scope:this } },
                        { text: this.msg("context.menu.delete.item"), onclick: { fn: this.deleteNode, scope:this  } }
                    ]
                }
            );
            
           

            /*
                 Subscribe to the "contextmenu" event for the element(s)
                 specified as the "trigger" for the ContextMenu instance.
            */
            
            oContextMenu.subscribe("triggerContextMenu", this._onTriggerContextMenu,this);
  
 			
        },
        
        _onEventEditNode: function(oArgs) {
        	oArgs.node.editNode();
        },
        _editorCancelEvent: function (oArgs) { // newValue , oldValue , node
       	 if (oArgs.data.nodeRef == null) {
       		oArgs.tree.removeNode(oArgs,true);
       	 }	 

        },
        _editorSaveEvent:function (oArgs) { // newValue , oldValue , node
        	 if (oArgs.node.data.nodeRef == null) {
        		 //Handle new item
					var actionCallback = {
	                success: function(o) {
	                	var results = YAHOO.lang.JSON.parse(o.responseText)
	                	var nodeData =  {
								label: results.item.label,
								nodeRef: results.item.nodeRef,
							    isLeaf : true,
							    labelStyle: "",
						        type : "text",
						        children: [],
						        editable:true
						};
	        			
	                	//trigger refresh/load
	                	this.oCurrentTextNode = this.root.clazz.oCurrentTextNode;
						this.oCurrentTextNode.isLeaf = false;
	                	this.removeChildren(this.oCurrentTextNode,true);
	                	this.oCurrentTextNode.expand();
	                	this.oCurrentTextNode = null;
	
	                	
	                },
	                failure: function(o) {
	                    alert("failure:" + o);
	                },
	                scope:this
	             };
			
	            var actionUrl = Alfresco.constants.PROXY_URI + "acando/console/sync-treelist-manager/" + this.root.clazz.oCurrentTextNode.data.nodeRef + "/addFolder/?t=" + Alfresco.util.encodeURIPath(oArgs.newValue)  + "&i=" + oArgs.node.data.newOrdinal;
	             
	           var transaction = YAHOO.util.Connect.asyncRequest('GET', actionUrl,actionCallback, null);

        	 } else {
        		 //Handle save name change
             	
             	var actionCallback = {
     	                success: function(o) {
     						    var attributes = { 
     								opacity: { from: 0.3, to: 1 } 
     							}; 
     							var anim = new YAHOO.util.Anim(this.node.contentElId, attributes); 
     							
     							anim.animate();
     						   
     	                },
     	                failure: function(o) {
     	                    alert("failure:" + o);
     	                },
     	                scope:oArgs
     	             };
     	
     	             var actionUrl = Alfresco.constants.PROXY_URI + "acando/console/sync-treelist-manager/" + oArgs.node.parent.data.nodeRef + "/changeName/?n=" + oArgs.node.data.nodeRef  + "&t=" + oArgs.newValue;
     	             
     	             var transaction = YAHOO.util.Connect.asyncRequest('GET', actionUrl,actionCallback, null);
     	             Dom.setStyle(oArgs.node.contentElId, "opacity", 0.30);
     	             oArgs.node.label = oArgs.newValue;
     	             //oArgs.node.refresh();
        	 }

        },
        
        /**
         * YUI WIDGET EVENT HANDLERS
         * Handlers for standard events fired from YUI widgets, e.g. "click"
         */

        _buildTree: function TLM_buildTree()
        {
        	var tree = new YAHOO.widget.TreeView(this.treeWidgetContainer);
            this.widgets.treeview = tree;
            
            tree.setDynamicLoad(this.fnLoadNodeData);
         // Get root node for tree
            var root = tree.getRoot();
            root.clazz = this;
            

            // Add default top-level node
            this.buildTreeNode(
            {
               label: Alfresco.util.message("tool.treelist-manager.rootnode.label"),
               type: "text",
               nodeRef: null,
               isLeaf:false,
               labelStyle:"list-root",
               children:[]
            }, root, true);

            // Render tree with this one top-level node
            tree.render();
      
        },
   
        
        
        /**
         * Dynamically loads TreeView nodes.
         * This MUST be inline in order to have access to the Alfresco.DocListTree class.
         * @method fnLoadNodeData
         * @param node {object} Parent node
         * @param fnLoadComplete {function} Expanding node's callback function
         */
       
        fnLoadNodeData: function TLM_fnLoadNodeData(node, fnLoadComplete)
        {
           // Get the path this node refers to
           var parentNode = node.data.nodeRef;
           if (parentNode === null) {
        	   parentNode = "root";
           }

           // Prepare URI for XHR data request
           var uri = Alfresco.constants.PROXY_URI + "acando/console/treelist-manager/" + parentNode;
           
           var me = this;
          
           // Prepare the XHR callback object
           var callback =
           {
              success: function TLM_loadSuccess(oResponse)
              {
                 var results = YAHOO.lang.JSON.parse(oResponse.responseText), item, treeNode;
                 if (results.error) {
                	 node.isLoading = false;
                	 node.isLeaf = true;
                	 node.label = "Could not load lists";
                	 node.labelStyle = "ygtverror";
                	 node.refresh();
                	 return;
                 }
                 // Update parent node nodeId if we didn't have it before
                 if (results.nodeRef !== null && results.nodeRef !== "" )
                 {
                    node.data.nodeRef = results.nodeRef;
                 }

                 if (results.children)
                 {
                    for (var i = 0, j = results.children.length; i < j; i++)
                    {
                       var child = results.children[i];
                       child.editable = true;
                       if (node.depth>0) {
                    	   child.labelStyle = "icon-ppt list-item";
                       } else {
                    	   child.labelStyle = "icon-doc list-folder";
                       }
                       
                       treeNode = this.clazz.buildTreeNode(child, node, false);

                    }
                 }
                 
                 
                 /**
                 * Execute the node's loadComplete callback method which comes in via the argument
                 * in the response object
                 */
                 oResponse.argument.fnLoadComplete();
              },

              // If the XHR call is not successful, fire the TreeView callback anyway
              failure: function TLM_loadfailure(oResponse)
              {
            
                    try
                    {
                       var response = YAHOO.lang.JSON.parse(oResponse.responseText);
                       
                       // Get the "Documents" node
                       var rootNode = this.widgets.treeview.getRoot();
                       var docNode = rootNode.children[0];
                       docNode.isLoading = false;
                       docNode.isLeaf = true;
                       docNode.label = "Could not load lists";
                       docNode.labelStyle = "ygtverror";
                       rootNode.refresh();
                    }
                    catch(e) 
                    { 
                    	//Do something?
                    }
                
              },
              
              // Callback function scope
              scope: me,

              // XHR response argument information
              argument:
              {
                 "node": node,
                 "fnLoadComplete": fnLoadComplete
              }
           }; //callback

           // Make the XHR call using Connection Manager's asyncRequest method
           YAHOO.util.Connect.asyncRequest('GET', uri, callback);
        },   // fnLoadNodeData    
        /**
         * Build a tree node using passed-in data
         *
         * @method _buildTreeNode
         * @param nodeData {object} Object literal containing required data for new node
         * @param p_oParent {object} Optional parent node
         * @param p_expanded {object} Optional expanded/collaped state flag
         * @return {YAHOO.widget.TextNode} The new tree node
         */
        buildTreeNode: function DLT__buildTreeNode(nodeData, parentNode, isExpanded)
        {
           var textNode = new YAHOO.widget.TextNode(
           {
              label: $html(nodeData.label),
              nodeRef: nodeData.nodeRef,
              description: nodeData.description,
              isLeaf : nodeData.isLeaf,
              type : nodeData.type,
              labelStyle: nodeData.labelStyle,
              editable : nodeData.editable
           }, parentNode, isExpanded);
           if (parentNode && (!parentNode.isRoot())) {
        	   this.oTextNodeMap["ygtv" + textNode.index] = textNode;
        	   new Acando.TreeListManager.DDList("ygtv" + textNode.index,parentNode.data.nodeRef,"",this);
           }
           
           return textNode;
        }
        
       
        
    }); // end Extend

})(); // End function closure