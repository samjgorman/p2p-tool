import { Console } from "console";

// import the module
const mdns = require("mdns");

var inquirer = require("inquirer");

function advertiseHost(protocol: string) {
  //advertise a http server on port 4321
  const ad = mdns.createAdvertisement(mdns.tcp(protocol), 4321);
  ad.start();
}

function discoverHosts(protocol: string) {
  advertiseHost(protocol); // watch all http servers
  const browser = mdns.createBrowser(mdns.tcp(protocol));
  // const browser = mdns.createBrowser(mdns.tcp("http"));

  //Duplicates exist in serviceUp, so use a set

  //A matching service appeared
  browser.on("serviceUp", (service) => {
    //Can convert this service to an array
    var name = service.name;
    console.log("Discovered device name: ", name);
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

function discoverServices() {
  const all_the_types = mdns.browseThemAll();

  all_the_types.on("serviceUp", (service) => {
    var resolved = mdns.resolve(service, (err, found_service) => {
      console.log(found_service);
    });
    // console.log(service);
    // if (service.type.name === 'airplay') {
    //     console.log(service)
    // }
  });

  all_the_types.start();
}

function discoverDriver() {
  const service = inquirer
    .prompt([
      {
        /* Pass your questions in here */
        type: "list",
        name: "protocol",
        message: "What service would you like to use for MDNS discovery?",
        choices: ["http", "https"],
      },
    ])
    .then((answer) => {
      console.log(answer.protocol);
      discoverHosts(answer.protocol);
      // discoverServices(); //WIP
    })
    .catch((error) => {
      if (error.isTtyError) {
        // Prompt couldn't be rendered in the current environment
        console.log("Prompt couldn't be rendered in the current environment");
      } else {
        // Something else went wrong
        console.log("There's been an error:  ", error);
      }
    });
}

discoverDriver();
