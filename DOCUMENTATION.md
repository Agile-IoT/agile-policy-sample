## Modules

<dl>
<dt><a href="#module_contacts">contacts</a></dt>
<dd><p>A module loading contacts from memory and applying policies.
This module contains an example of read actions (list contacts) and write accions (add contact) which are mapped by this example from HTTP GET and POST requests</p>
</dd>
<dt><a href="#module_github">github</a></dt>
<dd><p>A module loading github updates for AGILE and applying policies.</p>
</dd>
<dt><a href="#module_sql">sql</a></dt>
<dd><p>A module using agile-sql connector to query databases.</p>
</dd>
<dt><a href="#module_router">router</a></dt>
<dd><p>A module with basic routes for the site.</p>
</dd>
<dt><a href="#module_utils">utils</a></dt>
<dd><p>A module providing common functionalities for this application</p>
</dd>
</dl>

<a name="module_contacts"></a>

## contacts
A module loading contacts from memory and applying policies.
This module contains an example of read actions (list contacts) and write accions (add contact) which are mapped by this example from HTTP GET and POST requests


* [contacts](#module_contacts)
    * [~executeAction()](#module_contacts..executeAction)
    * [~evaluateWrite()](#module_contacts..evaluateWrite)
    * [~evaluateRead()](#module_contacts..evaluateRead)

<a name="module_contacts..executeAction"></a>

### contacts~executeAction()
This module instantiates the agile-sdk with the current session token (from the router).
Then, it evaluates whether the user logged in can execute the contacts action.
To verify the policy, the policy for the action "actions.contacts" for entity equivalent to the current app (in the agile_conf.app object) is used.
Also, depending on whether the action is a read or a write, the proper arguments are passed to the agile pdp.
If the policy allows it, the module executes the call
Also for each element in the contacts array, the policy for "actions.contacts[${field}]" where field is the name of the file used is evaluated.
This allows for finer access control rules (i.e. you can read only name and email but not number)

**Kind**: inner method of [<code>contacts</code>](#module_contacts)  
<a name="module_contacts..evaluateWrite"></a>

### contacts~evaluateWrite()
This internal function checks that the authenticated user can write to the array of contacts. And if it is possible, it adds it to the list

**Kind**: inner method of [<code>contacts</code>](#module_contacts)  
<a name="module_contacts..evaluateRead"></a>

### contacts~evaluateRead()
This internal function checks that the authenticated user can read from to the array of contacts. Depending on which fields the user can read, it returns them or not in the array.

**Kind**: inner method of [<code>contacts</code>](#module_contacts)  
<a name="module_github"></a>

## github
A module loading github updates for AGILE and applying policies.

<a name="module_github..executeAction"></a>

### github~executeAction()
This module instantiates the agile-sdk with the current session token (from the router).
Then, it evaluates whether the user logged in can execute the github action.
To verify the policy, the policy for the action "actions.github" for entity equivalent to the current app (in the agile_conf.app object) is used.
Also, depending on whether the action is a read or a write, the proper arguments are passed to the agile pdp.
If the policy allows it, the module executes the call and returns an array of updates

**Kind**: inner method of [<code>github</code>](#module_github)  
<a name="module_sql"></a>

## SQL
A module using agile-sql connector to query databases. To configure the MySQL database, please see [agile-sql](https://github.com/Agile-IoT/agile-sql).

<a name="module_sql..executeAction"></a>

### sql~executeAction()
This module instantiates the agile-sdk with the current session token (from the router).
Then, it evaluates whether the user logged in can execute the sql actions.
To verify the policy, the policy for the action "actions.sql" for entity equivalent to the current app (in the agile_conf.app object) is used.
Also, depending on whether the action is a read or a write, the proper arguments are passed to the agile pdp.
If the policy allows it, the module executes the calls to the sql connector. It queries (CREATE, INSERT, SELECT) the user table in the <code>agile</code> database (the database must exist already).

**Kind**: inner method of [<code>sql</code>](#module_sql)  
<a name="module_router"></a>

## router
A module with basic routes for the site.

<a name="module_utils"></a>

## utils
A module providing common functionalities for this application


* [utils](#module_utils)
    * [~mapVerbToReadWrite()](#module_utils..mapVerbToReadWrite)
    * [~find_pages_model()](#module_utils..find_pages_model)
    * [~list_model_modules()](#module_utils..list_model_modules)

<a name="module_utils..mapVerbToReadWrite"></a>

### utils~mapVerbToReadWrite()
This function maps HTTP methods (GET, POST, etc) to read and write labels for the policy evaluation.
In practice this is used to pass the read or write argument to each module loaded in the module executeAction function.

**Kind**: inner method of [<code>utils</code>](#module_utils)  
<a name="module_utils..find_pages_model"></a>

### utils~find_pages_model()
This function lists all files including pages in the pages_model folder (/views/pages_model)
This is needed to automatically load all pages in the app
To add mode pages to render model, just add a page in the /views/pages_model that renders using ejs whatever your model delivers.

**Kind**: inner method of [<code>utils</code>](#module_utils)  
<a name="module_utils..list_model_modules"></a>

### utils~list_model_modules()
list all models found in the /model folder that can be loaded for the application.
To add more models to the app, just drop a file here that has the same interface the ones included so far.

**Kind**: inner method of [<code>utils</code>](#module_utils)  
