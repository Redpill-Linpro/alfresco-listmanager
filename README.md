# [Alfresco](http://www.alfresco.com) Listmanager
This addon provides a way to manage list of values to be used in alfresco metadata forms. The model provided constraints are not 
always suitable to use. Sometimes you just want to pick a value from a list without constraining anything. In addition there is no
need to restart Alfresco after editing the lists (which is the case when using contraints).

## Authors
[Marcus Cedergren](https://github.com/masse),

[Erik Billerby](https://github.com/billerby) 

### Contributors
[Bertrand Forest](https://github.com/bforest)

## Getting started

### Dependencies

#### Alfresco

This extension was created with the [Alfresco Maven SDK](https://arti
facts.alfresco.com/nexus/content/repositories/alfresco-docs/alfresco-lifecycle-aggregator/latest/index.html) and compiles against Alfresco Community 4.2.c. It has also been tested with:

* Alfresco Community 5.2.e
* Alfresco Enterprise 5.2.4

### Building

The project uses [Maven](http://maven.apache.org) for building.

Clone the source, enter the directory and execute

Generate JAR module with SDK 3 of Alfresco

`mvn clean install`

Generate AMP module with SDK 3 of Alfresco

`mvn clean package assembly:single install`

to build and install the artifact in your local Maven repository.

The output is one amp-file to be installed into the repository part of your Alfresco installation and one jar-file that is needed by Alfresco Share.

Declare those as dependencies in your artifacts (if you are using the Maven SDK), 
For Share:

if JAR module:

```
		<dependency>
		    <groupId>com.acando.alfresco</groupId>
		    <artifactId>listmanager-amp-share</artifactId>
		    <version>1.5.5</version>
		    <scope>runtime</scope>
		</dependency>
```

if AMP module:

```
		<dependency>
		    <groupId>com.acando.alfresco</groupId>
		    <artifactId>listmanager-amp-share</artifactId>
		    <version>1.5.5</version>
		    <scope>runtime</scope>
			<type>amp</type>
		</dependency>
```

For the Repository:

if JAR module:

```
 		<dependency>
 		    <groupId>com.acando.alfresco</groupId>
 		    <artifactId>listmanager-amp-repo</artifactId>
 		    <version>1.5.5</version>
 		</dependency>
```

if AMP module:

```
 		<dependency>
 		    <groupId>com.acando.alfresco</groupId>
 		    <artifactId>listmanager-amp-repo</artifactId>
 		    <version>1.5.5</version>
 		    <type>amp</type>
 		</dependency>
```
Don't forget to add it as an overlay in the maven-war-plugin configuration as well:

with old AMP module and old SDK alfresco:

```
	...
        <overlay>
            <groupId>com.acando.alfresco</groupId>
			<artifactId>listmanager-amp-repo</artifactId>
            <type>amp</type>
        </overlay>
	...
```

or, otherwise drop the jar-file in to ```tomcat/shared/classes``` of your installation and install the amp with the mmt-tool.

with JAR module and the new alfresco SDK 3 plugin maven:

```
	...
	  	  <plugin>
	          <groupId>org.alfresco.maven.plugin</groupId>
	          <artifactId>alfresco-maven-plugin</artifactId>
	          <version>${alfresco.sdk.version}</version>
	          <configuration>
				  ...
	              <!--
	                 JARs and AMPs that should be overlayed/applied to the Platform/Repository WAR
	                 (i.e. alfresco.war)
	                 -->
	              <platformModules>
	                  <!-- Bring in this JAR project, need to be included here, otherwise resources from META-INF
	                       will not be loaded, such as the test.html page
	                  -->
	                  <moduleDependency>
							<groupId>com.acando.alfresco</groupId>
							<artifactId>listmanager-amp-repo</artifactId>
	                        <version>1.5.5</version>
	                  </moduleDependency>
	              </platformModules>
				  ...
	          </configuration>
	      </plugin>
	...
```

or, otherwise drop the jar-file in to ```/<ALFRESCO PATH>/modules/platform``` of your installation of alfresco .

###### NOTE: This third option is not optimal use the second option or the first.

with AMP module and the new alfresco SDK 3 plugin maven:

```
	...
	  	  <plugin>
	          <groupId>org.alfresco.maven.plugin</groupId>
	          <artifactId>alfresco-maven-plugin</artifactId>
	          <version>${alfresco.sdk.version}</version>
	          <configuration>
				  ...
	              <!--
	                 JARs and AMPs that should be overlayed/applied to the Platform/Repository WAR
	                 (i.e. alfresco.war)
	                 -->
	              <platformModules>
	                  <!-- This AMP is needed if we are going to access the platform webapp from a Share webapp -->
	                  <!-- Share Services will be ignored if you are on Platform earlier than 5.1 -->
	                  <moduleDependency>                 
							<groupId>com.acando.alfresco</groupId>
							<artifactId>listmanager-amp-repo</artifactId>
	                        <version>1.5.5</version>
							<type>amp</type>
	                  </moduleDependency>
	              </platformModules>
				  ...
	          </configuration>
	      </plugin>
	...
```
or, otherwise drop the amp-file in to ```/<ALFRESCO PATH>/modules/platform``` of your installation of alfresco .

##### same thing for the share webapp

with old AMP module and old SDK alfresco:

```
	...
        <overlay>
            <groupId>com.acando.alfresco</groupId>
			<artifactId>listmanager-amp-share</artifactId>
            <type>amp</type>
        </overlay>
	...
```

or, otherwise drop the jar-file in to ```tomcat/shared/classes``` of your installation and install the amp with the mmt-tool.

with JAR module and the new alfresco SDK 3 plugin maven:

```
	...
	  	  <plugin>
	          <groupId>org.alfresco.maven.plugin</groupId>
	          <artifactId>alfresco-maven-plugin</artifactId>
	          <version>${alfresco.sdk.version}</version>
	          <configuration>
				  ...
	              <!--
	                 JARs and AMPs that should be overlayed/applied to the Platform/Repository WAR
	                 (i.e. alfresco.war)
	                 -->
	              <shareModules>
	                  <!-- Bring in this JAR project, need to be included here, otherwise resources from META-INF
	                       will not be loaded, such as the test.html page
	                  -->
	                  <moduleDependency>
							<groupId>com.acando.alfresco</groupId>
							<artifactId>listmanager-amp-share</artifactId>
	                        <version>1.5.5</version>
	                  </moduleDependency>
	              </shareModules>
				  ...
	          </configuration>
	      </plugin>
	...
```

or, otherwise drop the jar-file in to ```/<ALFRESCO PATH>/modules/share``` of your installation of alfresco .

###### NOTE: This third option is not optimal use the second option or the first.


with AMP module and the new alfresco SDK 3 plugin maven:

```
	...
	  	  <plugin>
	          <groupId>org.alfresco.maven.plugin</groupId>
	          <artifactId>alfresco-maven-plugin</artifactId>
	          <version>${alfresco.sdk.version}</version>
	          <configuration>
				  ...
	              <!--
	                 JARs and AMPs that should be overlayed/applied to the Platform/Repository WAR
	                 (i.e. alfresco.war)
	                 -->
	              <shareModules>
	                  <!-- This AMP is needed if we are going to access the platform webapp from a Share webapp -->
	                  <!-- Share Services will be ignored if you are on Platform earlier than 5.1 -->
	                  <moduleDependency>                 
							<groupId>com.acando.alfresco</groupId>
							<artifactId>listmanager-amp-share</artifactId>
	                        <version>1.5.5</version>
							<type>amp</type>
	                  </moduleDependency>
	              </shareModules>
				  ...
	          </configuration>
	      </plugin>
	...
```

or, otherwise drop the jar-file in to ```/<ALFRESCO PATH>/modules/share``` of your installation of alfresco .

### Usage

When correctly installed a new GUI can be found in the Admin console part of Alfresco Share Application Settings -> List Manager.

![Screenshot](/images/screenshot_listmanager.jpg "Screenshot")

To make use of the values from one list, use the customselectone.ftl form control supplied like this:

###### NOTE: to avoid collision with other addons the path of the form template is change from the old "/org/alfresco/components/form/controls/customselectone.ftl" to the "/service-listmanager/org/alfresco/components/form/controls/customselectone.ftl"

```					
<field id="ac:changeRequestStatus">
		<control template="/service-listmanager/org/alfresco/components/form/controls/customselectone.ftl">
			<control-param name="listboxname">changeRequest_status</control-param>
		</control>                   
</field>
```

```					
<field id="ac:changeRequestStatus">
		<control template="/service-listmanager/org/alfresco/components/form/controls/customselectmany.ftl">
			<control-param name="listboxname">changeRequest_status</control-param>
		</control>                   
</field>
```

Where "changeRequest_status" is the name of a list containing all change request statuses that our listbox should contain.

![Screenshot](/images/screenshot_crlist.jpg "Screenshot")


### Issue Management
If you want to report a bug please create a new [issue](https://github.com/Redpill-Linpro/alfresco-listmanager/issues)

### Contributions
Contributions are welcome. Clone the project, implement the change/feature and submit to github [pull request](https://github.com/Redpill-Linpro/alfresco-listmanager/pulls).

