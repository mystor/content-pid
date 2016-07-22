const { Cc, Ci } = require("chrome");
const { ToggleButton } = require("sdk/ui/button/toggle");
const { Panel } = require("sdk/panel");
const tabs = require("sdk/tabs");
const { viewFor } = require("sdk/view/core");
const { getBrowserForTab } = require("sdk/tabs/utils");

var button = ToggleButton({
  id: "pid-button",
  label: "Content PID",
  icon: "./icon-64.png",
  onChange: handleChange
});

var panel = Panel({
  width: 90,
  height: 50,
  contentURL: "data:text/html,No PID read yet!",
  onHide: function() {
    button.state('window', {checked: false});
  }
});

const appinfo = Cc["@mozilla.org/xre/app-info;1"]
        .getService(Ci.nsIXULRuntime);

function handleChange(state) {
  if (state.checked) {
    const mm = getBrowserForTab(viewFor(tabs.activeTab)).messageManager;

    // Load the frame script to get the process ID
    mm.loadFrameScript("data:,(" + (() => {
      const appinfo = Components.classes["@mozilla.org/xre/app-info;1"]
              .getService(Components.interfaces.nsIXULRuntime);
      sendAsyncMessage("pid-button:pid", appinfo.processID);
    }).toSource() + ")();", true);

    // Wait for the message to be sent back
    mm.addMessageListener("pid-button:pid", function listener(aMessage) {
      mm.removeMessageListener("pid-button:pid", listener);

      // XXX: This is ugly, but easy.
      panel.contentURL = `data:text/html,
<html style="overflow:hidden;">
  <b>P: ${appinfo.processID}</b><br>
  <b>C: ${aMessage.data}</b>
</html>`;

      // Show the panel at the button
      panel.show({
        position: button
      });
    });
  }
}
