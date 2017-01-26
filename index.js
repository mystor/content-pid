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
    let contentPID = appinfo.processID;

    const fl = getBrowserForTab(viewFor(tabs.activeTab)).frameLoader;
    if (fl.tabParent) {
      contentPID = fl.tabParent.osPid;
    }

    panel.contentURL = `data:text/html,
<html style="overflow:hidden;">
  <b>P: ${appinfo.processID}</b><br>
  <b>C: ${contentPID}</b>
</html>`;

    // Show the panel at the button
    panel.show({
      position: button
    });
  }
}
