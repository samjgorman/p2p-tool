import { Console } from "console";


// import the module
const mdns = require("mdns");

var inquirer = require('inquirer');



function advertiseServer(protocol:string){
  //advertise a http server on port 4321
  const ad = mdns.createAdvertisement(mdns.tcp(protocol), 4321);
  ad.start();
}

function discoverServices(protocol:string){

  advertiseServer(protocol);  // watch all http servers
  const browser = mdns.createBrowser(mdns.tcp(protocol));
  // const browser = mdns.createBrowser(mdns.tcp("http"));
  
  //Duplicates exist in serviceUp, so use a set 
  
  //A matching service appeared
  browser.on("serviceUp", (service) => {
    //Can convert this service to an array
    var name = service.name;
    console.log("Discovered device name: ",name);
  });
  
  //A matching service disappeared
  browser.on("serviceDown", (service) => {
   
    console.log("service down: ", service.name);
  });
  
  //There was an error
  browser.on("error", (exception) => {
    console.log("error", exception);
  });

  browser.start();
 
}

function discoverDriver(){

  const service = inquirer
    .prompt([{
      /* Pass your questions in here */
      type: "list",
			name: "protocol",
      message: 'What service would you like to use for MDNS discovery?',
      choices: ['http', 'https']
    }
    ])
    .then((answer) => {
      console.log(     answer.protocol );
      discoverServices( answer.protocol );

    })
    .catch((error) => {
      if (error.isTtyError) {
        // Prompt couldn't be rendered in the current environment
        console.log("There's been an error");
      } else {
        // Something else went wrong
        console.log("There's been a different error");
        console.log(error);

      }
    });



}

discoverDriver();



//call this after the two listeners have finished...

// discover all available service types
// const all_the_types = mdns.browseThemAll(); // all_the_types is just another browser...
// console.log(all_the_types);