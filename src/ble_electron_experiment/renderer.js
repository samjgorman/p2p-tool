const { ipcRenderer } = require("electron");
// var bleno = require("bleno");

document.getElementById("Select").addEventListener("click", testIt);

function renderList(mainProcessDeviceList) {
  console.log("I rendered!");
  const list = document.querySelector(".Devices");
  for (let i = 0; i < mainProcessDeviceList.length; i++) {
    if (
      mainProcessDeviceList[i].deviceName.includes(
        "Unknown or Unsupported Device"
      )
    )
      continue;

    const device = document.createElement("div");
    device.innerHTML =
      "Device:" +
      mainProcessDeviceList[i].deviceName +
      " , " +
      mainProcessDeviceList[i].deviceId;
    list.appendChild(device);
  }
}

// async function connectToDevice() {
//   const device = {
//     deviceName: "iPhone",
//     deviceId: "DF:3C:6E:D2:73:3C",
//   };
//   try {
//     await device.gatt.connect();
//     console.log('> Bluetooth device "' + device.name + " connected.");
//   } catch (error) {
//     console.log("Argh! " + error);
//   }
// }

async function getDevice(device_object) {
  let options = {
    filters: [{ name: device_object.name }],
    optionalServices: ["battery_service"],
  };

  const found_device = await navigator.bluetooth
    .requestDevice(options)
    .then(function (device) {
      console.log("Name: " + device.name);
      // Do something with the device.
      connectToBluetoothDevice(device);
    })
    .catch(function (error) {
      console.log("Something went wrong. " + error);
    });
}

async function connectToBluetoothDevice(device) {
  const abortController = new AbortController();

  device.addEventListener(
    "advertisementreceived",
    async (event) => {
      log('> Received advertisement from "' + device.name + '"...');
      // Stop watching advertisements to conserve battery life.
      abortController.abort();
      log('Connecting to GATT Server from "' + device.name + '"...');
      try {
        await device.gatt.connect();
        log('> Bluetooth device "' + device.name + " connected.");
      } catch (error) {
        log("Argh! " + error);
      }
    },
    { once: true }
  );

  try {
    console.log('Watching advertisements from "' + device.name + '"...');
    await device.watchAdvertisements({ signal: abortController.signal });
  } catch (error) {
    console.log("Argh! " + error);
  }
}

//electron application listens for the devicelist from main process
var count = 0;
ipcRenderer.on("channelForBluetoothDeviceList", (event, list) => {
  if (count == 300) {
    //Will refactor this
    mainProcessDeviceList = list;
    const device = {
      deviceName: "iPhone",
      deviceId: "DF:3C:6E:D2:73:3C",
    };
    renderList(mainProcessDeviceList);
    // connectToDevice();
    for (const device of mainProcessDeviceList) {
      console.log(device);
      //   getDevice(device); still WIP
    }
    //Shut down the listener
  }
  count++;
});
