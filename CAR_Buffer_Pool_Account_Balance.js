const fs = require("fs").promises; // Using promises version of fs for asynchronous file operations
const { By, Builder } = require("selenium-webdriver");
require("selenium-webdriver/chrome");

async function getProjectId(data = "") {
  if (data.length) {
    return data.replace("CAR", "");
  }
  return null;
}

async function saveJSONToFile(jsonContents, fileName) {
  try {
    // Convert the new JSON data to a string
    const newData = JSON.stringify(jsonContents, null, 2);

    // Check if the file exists
    const fileExists = await fs
      .access(fileName)
      .then(() => true)
      .catch(() => false);

    // Prepare the content to be written to the file
    let contentToWrite = newData;

    if (fileExists) {
      // If the file exists, read its contents
      const existingData = await fs.readFile(fileName, "utf8");

      // Remove leading and trailing square brackets if they exist
      const existingDataTrimmed = existingData.trim().replace(/^\[|\]$/g, "");

      // Add a comma if the existing data is not empty
      if (existingDataTrimmed !== "") {
        contentToWrite = `${existingDataTrimmed},${newData}`;
      } else {
        contentToWrite = newData;
      }
    }

    // Write the content to the file with square brackets
    await fs.writeFile(fileName, `[${contentToWrite}]`);
    console.log(`Data saved to ${fileName}`);
  } catch (error) {
    console.error("Error saving JSON to file:", error);
  }
}

async function getBuffer_pool_account_balance() {
  let driver = await new Builder().forBrowser("chrome").build();
  try {
    await driver.get(
      "https://thereserve2.apx.com/myModule/rpt/myrpt.asp?r=706"
    );
    while (true) {
      const rows = await driver.findElements(By.xpath("//table/tbody/tr"));
      for (let i = 5; i < rows.length - 4; i++) {
        try {
          const row = rows[i];
          const cells = await row.findElements(By.css("td"));

          const project_id = await cells[0].getText();
          const project_name = await cells[1].getText();
          const projectId = await getProjectId(await cells[0].getText());
          const project_developer = await cells[2].getText();
          const project_type = await cells[3].getText();
          const reduction_removal = await cells[4].getText();
          const project_site_state = await cells[5].getText();
          const project_site_country = await cells[6].getText();
          const corsia_eligible = await cells[7].getText();
          const corresponding_adjustment = await cells[8].getText();
          const additional_certifications = await cells[9].getText();
          const vintage = await cells[10].getText();
          const deposit_date = await cells[11].getText();
          const offset_credits_deposited = await cells[12].getText();
          const offset_credits_released = await cells[13].getText();
          const offset_credits_retired = await cells[14].getText();
          const offset_credits_canceled = await cells[15].getText();
          const offset_credits_canceled_for_arb = await cells[16].getText();
          const buffer_pool_balance = await cells[17].getText();

          await saveJSONToFile(
            {
              project_id: project_id,
              project_name: project_name,
              project_developer: project_developer,
              project_type: project_type,
              reduction_removal: reduction_removal,
              project_site_state: project_site_state,
              project_site_country: project_site_country,
              corsia_eligible: corsia_eligible,
              corresponding_adjustment: corresponding_adjustment,
              additional_certifications: additional_certifications,
              vintage: vintage,
              deposit_date: deposit_date,
              offset_credits_deposited: offset_credits_deposited,
              offset_credits_released: offset_credits_released,
              offset_credits_retired: offset_credits_retired,
              offset_credits_canceled: offset_credits_canceled,
              offset_credits_canceled_for_arb: offset_credits_canceled_for_arb,
              buffer_pool_balance: buffer_pool_balance,
            },
            `./buffer_pool_account_balance_details/${projectId}.json`
          );
        } catch (error) {
          // Handle StaleElementReferenceError by refreshing the page
          if (error.name === "StaleElementReferenceError") {
            console.log("Stale element detected. Refreshing page...");
            await driver.navigate().refresh();
            console.log("Page refreshed. Re-locating elements...");
            continue; // Continue to the next iteration of the loop
          }
          throw error; // Re-throw any other errors
        }
      }

      const nextPageButton = await driver.findElement(By.id("x999nextbutton2"));
      const nextButtonSrc = await nextPageButton.getAttribute("src");

      if (nextButtonSrc === "https://thereserve2.apx.com/ImgTable/next.gif") {
        await nextPageButton.click();
        await driver.sleep(2000);
        console.log("Data going to the next page");
      } else {
        console.log("No more pages. Exiting loop.");
        break;
      }
    }
  } catch (error) {
    console.error(error);
  } finally {
    await driver.quit();
  }
}

async function getHrefAttribute(cell, driver) {
  try {
    const anchorElement = await cell.findElement(By.css("a"));
    return await anchorElement.getAttribute("href");
  } catch (error) {
    // If anchor element not found, return empty string
    return "";
  }
}

getBuffer_pool_account_balance();
