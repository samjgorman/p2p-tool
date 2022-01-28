const { ipcRenderer } = require("electron");

async function testIt() {
  const device = await navigator.bluetooth.requestDevice({
    acceptAllDevices: true,
  });
}

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
    device.innerHTML = mainProcessDeviceList[i].deviceName;
    list.appendChild(device);
  }
}

//electron application listens for the devicelist from main process
var count = 0;
ipcRenderer.on("channelForBluetoothDeviceList", (event, list) => {
  if (count == 300) {
    //Not ideal for now
    mainProcessDeviceList = list;
    // console.log(mainProcessDeviceList);
    renderList(mainProcessDeviceList);
    //Shut down the listener
  }
  count++;
});
