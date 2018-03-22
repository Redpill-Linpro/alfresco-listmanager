<#-- Hidden iframe is used by yui-history module -->
<!--[if IE]>
<iframe id="yui-history-iframe" src="${url.context}/res/yui/history/assets/blank.html"></iframe> 
<![endif]-->
<input id="yui-history-field" type="hidden" />

<#assign el=args.htmlid?html>
<script type="text/javascript">//<![CDATA[
    new Acando.TreeListManager("${el}").setMessages(${messages});
//]]></script>
</script>

<div id="${el}-body" class="sample-console">
        <div id="${el}-form" class="hidden">
	        <div class="header-bar">
	            <div class="title">${msg("label.title")}</div>
	            <div class="helptext">
	            	<ul>${msg("label.prompt")}
	            		<li>${msg("tooltip1")}</li>
	            		<li>${msg("tooltip2")}</li>
	            		<li>${msg("tooltip3")}</li>
	            	</ul>
	            </div>
	        </div>
	    </div>
     <div id="${el}-treewidget"></div> 
</div>
