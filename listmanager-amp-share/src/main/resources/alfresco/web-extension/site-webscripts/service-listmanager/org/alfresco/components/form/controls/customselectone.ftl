<#include "/org/alfresco/components/form/controls/common/utils.inc.ftl" />

<#if field.control.params.optionSeparator??>
   <#assign optionSeparator=field.control.params.optionSeparator>
<#else>
   <#assign optionSeparator=",">
</#if>
<#if field.control.params.labelSeparator??>
   <#assign labelSeparator=field.control.params.labelSeparator>
<#else>
   <#assign labelSeparator="|">
</#if>

<div class="form-field">
   <#if form.mode == "view">
      <div class="viewmode-field">
         <#if field.mandatory && !(field.value?is_number) && field.value?string == "">
            <span class="incomplete-warning"><img src="${url.context}/res/components/form/images/warning-16.png" title="${msg("form.field.incomplete")}" /><span>
         </#if>
         <span class="viewmode-label">${field.label?html}:</span>
         <#if field.value?string == "">
            <#assign valueToShow=msg("form.control.novalue")>
         <#else>
            <#assign valueToShow=field.value>
            <#if field.control.params.options??>
	            <#list field.control.params.options?split(optionSeparator) as nameValue>
	               <#if nameValue?index_of(labelSeparator) == -1>
	                  <#if nameValue == field.value?string || (field.value?is_number && field.value?c == nameValue)>
	                     <#assign valueToShow=nameValue>
	                     <#break>
	                  </#if>
	               <#else>
	                  <#assign choice=nameValue?split(labelSeparator)>
	                  <#if choice[0] == field.value?string || (field.value?is_number && field.value?c == choice[0])>
	                     <#assign valueToShow=msgValue(choice[1])>
	                     <#break>
	                  </#if>
	               </#if>
	            </#list>
	          </#if>
         </#if>
         <span class="viewmode-value">${valueToShow?html}</span>
      </div>
   <#else>
   <script>//<![CDATA[
		// Ensure Acando namespace exists
		if (typeof Acando === "undefined" || !Acando) 
		{
		    var Acando = {};
		}
		
		(function() 
		{
			Acando.CustomSelectOne = function CustomSelectOne_constructor(htmlId) 
			{
				Acando.CustomSelectOne.superclass.constructor.call(this, htmlId);
							
				this.name = "Acando.CustomSelectOne";
				this.id = htmlId;
			
				Alfresco.util.ComponentManager.register(this);
				Alfresco.util.YUILoaderHelper.require(["button", "container"], this.onComponentsLoaded, this);
			
			    return this;
			};
		
			YAHOO.extend(Acando.CustomSelectOne, Alfresco.component.Base, 
			{
				options:
				{
				},
				setOptions: function CustomSelectOne_setOptions(obj) 
				{
				    this.options = YAHOO.lang.merge(this.options, obj);
				    return this;
				},
				setMessages: function CustomSelectOne_setMessages(obj) 
				{
					Alfresco.util.addMessages(obj, this.name);
					return this;
				},
				onReady: function CustomSelectOne_onReady()
				{
					var selectedValue = this.options.selectedValue; 
					var setOptionsCallback = 
					{
						success: function(o) 
						{
							var values, i;
							var listbox = YAHOO.util.Dom.get(this.id);
						
							try 
							{
								values = YAHOO.lang.JSON.parse(o.responseText);
								listbox.remove(listbox.length - 1); // Remove "Loading..." text
							} 
							catch (x) 
							{
								console.log("Json parse failed! " + x);
								return;
							}
							
							for(i = 0; i < values.length; i++) 
							{
								var v = values[i];
								var option = new Option('option');
								
								option.value = (v.value === null || v.value === "") ? v.label : v.value;
								option.text = v.label;
								option.selected = (option.value === selectedValue);
								listbox.add(option);
							}
						},
				  		failure: function(o) 
				  		{
				  			Alfresco.util.PopupManager.displayMessage({text: "Could not load values!"});
				  		},
				  		scope: this
					};
		
					var listUrl = Alfresco.constants.PROXY_URI + "listbox/" + this.options.listBoxName;
					var transaction = YAHOO.util.Connect.asyncRequest('GET', listUrl, setOptionsCallback, null);
				}
			});
		})();
		   
		var options = {};
		options.selectedValue = "${field.value}";
		options.listBoxName = "${field.control.params.listboxname}";
		new Acando.CustomSelectOne("${fieldHtmlId}").setOptions(options);
	//]]></script>
      <label for="${fieldHtmlId}">${field.label?html}:<#if field.mandatory><span class="mandatory-indicator">${msg("form.required.fields.marker")}</span></#if></label>
      <#if field.control.params.listboxname?? && field.control.params.listboxname != "">
         <select id="${fieldHtmlId}" name="${field.name}" tabindex="0"
               <#if field.description??>title="${field.description}"</#if>
               <#if field.control.params.size??>size="${field.control.params.size}"</#if> 
               <#if field.control.params.styleClass??>class="${field.control.params.styleClass}"</#if>
               <#if field.control.params.style??>style="${field.control.params.style}"</#if>
               <#if field.disabled  && !(field.control.params.forceEditable?? && field.control.params.forceEditable == "true")>disabled="true"</#if>>
               <option>Loading...</option>
         </select>
         <@formLib.renderFieldHelp field=field />
      <#else>
         <div id="${fieldHtmlId}-missing" class="missing-options">${msg("form.control.selectone.missing-options")}</div>
      </#if>
   </#if>
</div>