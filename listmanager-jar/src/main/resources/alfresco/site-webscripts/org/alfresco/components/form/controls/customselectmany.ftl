<#include "/org/alfresco/components/form/controls/common/utils.inc.ftl" />
<#if field.control.params.size??><#assign size=field.control.params.size><#else><#assign size=5></#if>

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

<#assign fieldValue=field.value>

<#if fieldValue?string == "" && field.control.params.defaultValueContextProperty??>
   <#if context.properties[field.control.params.defaultValueContextProperty]??>
      <#assign fieldValue = context.properties[field.control.params.defaultValueContextProperty]>
   <#elseif args[field.control.params.defaultValueContextProperty]??>
      <#assign fieldValue = args[field.control.params.defaultValueContextProperty]>
   </#if>
</#if>
<#if field.control.params.defaultValues??>

      <#assign fieldValue = field.control.params.defaultValues>
</#if>

<#if fieldValue?string != "">
   <#assign values=fieldValue?split(",")>
<#else>
   <#assign values=[]>
</#if>

<div class="form-field">
   <#if form.mode == "view">
      <div class="viewmode-field">
         <#if field.mandatory && !(fieldValue?is_number) && fieldValue?string == "">
            <span class="incomplete-warning"><img src="${url.context}/res/components/form/images/warning-16.png" title="${msg("form.field.incomplete")}" /><span>
         </#if>
         <span class="viewmode-label">${field.label?html}:</span>
         <#if fieldValue?string == "">
            <#assign valueToShow=msg("form.control.novalue")>
         <#else>
            <#if field.control.params.options?? && field.control.params.options != "" &&
                 field.control.params.options?index_of(labelSeparator) != -1>
                 <#assign valueToShow="">
                 <#assign firstLabel=true>
                 <#list field.control.params.options?split(optionSeparator) as nameValue>
                    <#assign choice=nameValue?split(labelSeparator)>
                    <#if isSelected(choice[0])>
                       <#if !firstLabel>
                          <#assign valueToShow=valueToShow+",">
                       <#else>
                          <#assign firstLabel=false>
                       </#if>
                       <#assign valueToShow=valueToShow+choice[1]>
                    </#if>
                 </#list>
            <#else>
               <#assign valueToShow=fieldValue>
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
			Acando.CustomSelectMany = function CustomSelectMany_constructor(htmlId) 
			{
				Acando.CustomSelectMany.superclass.constructor.call(this, htmlId);

				this.name = "Acando.CustomSelectMany";
				this.id = htmlId;

				Alfresco.util.ComponentManager.register(this);
				Alfresco.util.YUILoaderHelper.require(["button", "container"], this.onComponentsLoaded, this);

			    return this;
			};

			YAHOO.extend(Acando.CustomSelectMany, Alfresco.component.Base, 
			{
				options:
				{
				},
				setOptions: function CustomSelectMany_setOptions(obj) 
				{
				    this.options = YAHOO.lang.merge(this.options, obj);
				    return this;
				},
				setMessages: function CustomSelectMany_setMessages(obj) 
				{
					Alfresco.util.addMessages(obj, this.name);
					return this;
				},
				onReady: function CustomSelectMany_onReady()
				{
					var selectedValue = this.options.selectedValue; 
					var setOptionsCallback = 
					{
						success: function(o) 
						{
							var values, i;
							var listbox = YAHOO.util.Dom.get(this.id + "-entry");

							try 
							{
								values = YAHOO.lang.JSON.parse(o.responseText);
								listbox.remove(listbox.length - 1); // Remove "Loading..." text
							} 
							catch (x) 
							{
								//console.log("Json parse failed! " + x);
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
		new Acando.CustomSelectMany("${fieldHtmlId}").setOptions(options);
	//]]></script>
      <label for="${fieldHtmlId}-entry">${field.label?html}:<#if field.mandatory><span class="mandatory-indicator">${msg("form.required.fields.marker")}</span></#if></label>
      <input id="${fieldHtmlId}" type="hidden" name="${field.name}" value="${fieldValue?string}" />
      <#if field.control.params.listboxname?? && field.control.params.listboxname != "">
         <select id="${fieldHtmlId}-entry" name="-" multiple="multiple" size="${size}" tabindex="0"
               onchange="javascript:Alfresco.util.updateMultiSelectListValue('${fieldHtmlId}-entry', '${fieldHtmlId}', <#if field.mandatory>true<#else>false</#if>);"
               <#if field.description??>title="${field.description}"</#if> 
               <#if field.control.params.styleClass??>class="${field.control.params.styleClass}"</#if>
               <#if field.control.params.style??>style="${field.control.params.style}"</#if>
               <#if field.disabled && !(field.control.params.forceEditable?? && field.control.params.forceEditable == "true")>disabled="true"</#if>>
               <option>Loading...</option>
         </select>
         <@formLib.renderFieldHelp field=field />
      <#else>
         <div id="${fieldHtmlId}" class="missing-options">${msg("form.control.selectone.missing-options")}</div>
      </#if>
   </#if>
</div>
<#function isSelected optionValue>
   <#list values as value>
      <#if optionValue == value?string || (value?is_number && value?c == optionValue)>
         <#return true>
      </#if>
   </#list>
   <#return false>
</#function>

