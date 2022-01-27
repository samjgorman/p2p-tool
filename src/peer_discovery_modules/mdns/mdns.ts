

// import the module
const mdns = require("mdns");

// advertise a http server on port 4321
const ad = mdns.createAdvertisement(mdns.tcp("https"), 4321);
ad.start();

// watch all http servers
const browser = mdns.createBrowser(mdns.tcp("https"));
// const browser = mdns.createBrowser(mdns.tcp("http"));

//Duplicates exist in serviceUp, so use a set 
var available_service_table: Array<any>;


//A matching service appeared
browser.on("serviceUp", (service) => {
  //Can convert this service to an array
  var service_arr = service.toArray();
  available_service_table.push(service_arr);
  // console.log("service up: ", service);
});

//A matching service disappeared
browser.on("serviceDown", (service) => {
  // const idx_to_remove = available_service_table.indexOf(service);
  // available_service_table.splice(idx_to_remove,1);

  // console.log("service down: ", service);
});

//call this after the two listeners have finished...


browser.start();




// discover all available service types
// const all_the_types = mdns.browseThemAll(); // all_the_types is just another browser...
// console.log(all_the_types);