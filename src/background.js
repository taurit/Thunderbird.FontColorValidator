// This is a proof-of-concept for a Thunderbird add-on.
// It warns if sent email contains font colors that might be invisible in dark mode or light mode of recipient's email client.

// This code is a first attempt to learn if such a simple heuristic can be useful. There are endless ways to reduce rate of false positives and false negatives if that turns out to be useful.


function isProblematicColorUsedInEmail(emailBody) {
  // Warn about:
  // - white => because the text might not be visible in a light mode
  // - black => because the text might not be visible in a dark mode
  // - f9f9fa => this is almost white, and this is the default suggested color in Thunderbird's UI in the dark mode
  const regex = /color=\"#ffffff\"|color=\"#000000\"|color=\"#f9f9fa\"/gi;

  return regex.test(emailBody);
}


async function validateEmailForInvisibleFontColor(tabId) {
  let details = await browser.compose.getComposeDetails(tabId);
  let bodyContainsTextInProblematicColor = isProblematicColorUsedInEmail(details.body);
  if (bodyContainsTextInProblematicColor) {
    let shouldSend = await browser.tabs.executeScript(tabId, {
      code: `confirm("This email contains hardcoded black or white font colors. This may not be readable in dark or light mode email clients. Do you still want to send this email?")`
    });

    let userSelectedToSendEmailAnyway = shouldSend[0];
    return userSelectedToSendEmailAnyway;
  } else {
    // no problem detected, so continue sending email without any additional warning
    return true;
  }

}

browser.compose.onBeforeSend.addListener(async (tab, details) => {
  let shouldSend = await validateEmailForInvisibleFontColor(tab.id);
  if (!shouldSend) {
    return { cancel: true };
  }
});