/**
 * Simple bleno echo server
 * Author: Shawn Hymel
 * Date: November 22, 2015
 *
 * Creates a Bluetooth Low Energy device using bleno and offers one service
 * with one characteristic. Users can use a BLE test app to read, write, and
 * subscribe to that characteristic. Writing changes the characteristic's
 * value, reading returns that value, and subscribing results in a string
 * message every 1 second.
 *
 * This example is Beerware (https://en.wikipedia.org/wiki/Beerware).
 */

// Using the bleno module
var bleno = require("bleno");

// Once bleno starts, begin advertising our BLE address
bleno.on("stateChange", function (state) {
  console.log("State change: " + state);
  if (state === "poweredOn") {
    bleno.startAdvertising("MyDevice", ["12ab"]);
  } else {
    bleno.stopAdvertising();
  }
});

// Notify the console that we've accepted a connection
bleno.on("accept", function (clientAddress) {
  console.log("Accepted connection from address: " + clientAddress);
});

// Notify the console that we have disconnected from a client
bleno.on("disconnect", function (clientAddress) {
  console.log("Disconnected from address: " + clientAddress);
});

// When we begin advertising, create a new service and characteristic
bleno.on("advertisingStart", function (error) {
  if (error) {
    console.log("Advertising start error:" + error);
  } else {
    console.log("Advertising start success");
    bleno.setServices([
      // Define a new service
      new bleno.PrimaryService({
        uuid: "12ab",
        characteristics: [
          // Define a new characteristic within that service
          new bleno.Characteristic({
            value: null,
            uuid: "34cd",
            properties: ["notify", "read", "write"],

            // If the client subscribes, we send out a message every 1 second
            onSubscribe: function (maxValueSize, updateValueCallback) {
              console.log("Device subscribed");
              this.intervalId = setInterval(function () {
                console.log("Sending: Hi!");
                updateValueCallback(new Buffer("Hi!"));
              }, 1000);
            },

            // If the client unsubscribes, we stop broadcasting the message
            onUnsubscribe: function () {
              console.log("Device unsubscribed");
              clearInterval(this.intervalId);
            },

            // Send a message back to the client with the characteristic's value
            onReadRequest: function (offset, callback) {
              console.log("Read request received");
              callback(
                this.RESULT_SUCCESS,
                new Buffer(
                  "Echo: " + (this.value ? this.value.toString("utf-8") : "")
                )
              );
            },

            // Accept a new value for the characterstic's value
            onWriteRequest: function (data, offset, withoutResponse, callback) {
              this.value = data;
              console.log(
                "Write request: value = " + this.value.toString("utf-8")
              );
              callback(this.RESULT_SUCCESS);
            },
          }),
        ],
      }),
    ]);
  }
});
