[
<#list listboxvalues as result>
	{
   		"label": "${result.properties.title}",
   		"value": "${result.properties.title}"
   	}<#if result_has_next>,</#if>
</#list>
]
