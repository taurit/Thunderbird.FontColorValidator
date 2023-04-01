function checkFontColor(body) {
    const regex = /color=\"#ffffff\"|color=\"#000000\"/gi;
    return regex.test(body);
  }
  
  async function warnBeforeSend(tabId) {
    let details = await browser.compose.getComposeDetails(tabId);
    let bodyContainsHardcodedColor = checkFontColor(details.body);
    console.log("bodyContainsHardcodedColor=" + bodyContainsHardcodedColor);
    if (bodyContainsHardcodedColor) {
      console.log("displaying confirmation dialog...");
      let shouldSend = await browser.tabs.executeScript(tabId, {
        code: `confirm("This email contains hardcoded black or white font colors. This may not be readable in dark or light mode email clients. Do you still want to send this email?")`
      });

      console.log("displaying confirmation dialog...");
      if (!shouldSend[0]) {
        return false;
      }
    }
    return true;
  }
  
  browser.compose.onBeforeSend.addListener(async (tab, details) => {
    let shouldSend = await warnBeforeSend(tab.id);
    if (!shouldSend) {
      return { cancel: true };
    }
  });