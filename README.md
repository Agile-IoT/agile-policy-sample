# AGILE POLICY SAMPLE

This project contains a sample to let users interested in using the agile security framework have an initial application that uses agile policies to control access to its data (data must not come from the agile APIs only).

## Quick getting started guide!

install the app:

```
git clone https://github.com/Agile-IoT/agile-policy-sample
cd agile-policy-sample
npm install
```

update the configuration file (lib/agile_conf.js) to point to your agile installation inside the sdk object. Also, you should reference a valid agile-security client or entity registered in your gateway (in the app attribute of the configuration). By default is uses the id of osjs which comes pre-configured in your gateway so it will run out of the box. Then start the app

```
npm start
```

Then log-in in your gateway by going to  OSJS (http://$AGILE_HOST:8000). Then copy the token from your URL, and then go to your app passing the token as an argument. For example, if your token is WOuR8Le5Y3TQryvymkTdtXTeYROrMSLVV4ga9FWaAW66M2taGDSXekFSI23rDlpJ you should do this:

```
http://localhost:4000/?token=WOuR8Le5Y3TQryvymkTdtXTeYROrMSLVV4ga9FWaAW66M2taGDSXekFSI23rDlpJ
```


## What the application is about

There are several frameworks on top of which applications can be developed in Node.js.
This example tries to use the "easiest" JavaScript possible; to this end, we only use express and additional modules for body parsing, session mapping, and ejs to render pages.

### Built in functionality

This application has  two main "model" modules:

* contacts: keeps an in-memory list of contacts (objects with name, number and email attributes) and sends them to the browser
* github: queries github to obtain the latest news from the agile-iot organization and renders the latest events with the icon of the github user, the kind of action and the repository associated with it.

### Extensibility

We call a "model" the code retrieving information, and to make this example a nice playground, you can add new "models" to integrate specific business logic to this application and try the agile policies with your own code.


To add a new "model" you should add two files in this project:

* file in lib/model exporting a function called executeAction that obtains a token (from AGILE security), a method (comes from the URL, this is further explained below) and args(content of the json-encoded body in the request, if there is a body, otherwise it is undefined):

```
executeAction = function(token, method, args){
  return new Promise((resolve, reject) => {
       //... resolve with the data you want to send to your model page
       // a simple example would be...
       resolve({message:"hello"})
       //... or reject with an error code that will be shown in the error page
       // like so reject(createError(500,"Error in my app!"))
  });
```

* file in lib/views/pages_model this must contain an ejs template that can render the result from your model.

Both files need to have the same name, as the name is used to recognize that there is a module for the model as well as an ejs template to render it. Here is an example to render the message shown in the previous example

```
<!DOCTYPE html>
<html lang=”en”>
<body>
<%= message %>
</body>
</html>
```

*note*: all the routing between the web browser and your actions is done by the routers.js file, and it maps the urls /actions/{model_name} to the /lib/model/model_name.js for the backend and to /lib/views/pages_model/model_name.js for the page rendering the action.

## What this application is not about

To keep it as simple as possible, we don't dig deep into how an application can rely on agile-security to authenticate its users. This application is meant to be used, once you already obtained a token, e.g. from OSJS, as described in the quick starting guide.
For examples on how to connect an application with agile-security to authenticate users or obtain tokens that can be used for batch processes, please have a look at:

* [agile-oauth2-example](https://github.com/Agile-IoT/agile-idm-oauth2-client-example): a full-fledged oauth2 example for the authorization code flow.
* [agile-idm-examples](https://github.com/Agile-IoT/agile-idm-examples): include other examples to authenticate users. The client-credentials example uses a client id and a secret to obtain a token, while the implicit example uses a client to obtain  a token for a user without requiring server-side code. Another example of the latter is the [agile-idm-osjs connector](https://github.com/Agile-IoT/agile-idm-osjs/tree/2157f77d5c173787c110cada2d9285cefa0d7891).
