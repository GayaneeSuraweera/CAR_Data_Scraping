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

async function getODS_projects_of_destruction() {
  let driver = await new Builder().forBrowser("chrome").build();
  try {
    await driver.get(
      "https://thereserve2.apx.com/myModule/rpt/myrpt.asp?r=210"
    );
    while (true) {
      const rows = await driver.findElements(By.xpath("//table/tbody/tr"));
      for (let i = 5; i < rows.length - 4; i++) {
        try {
          const row = rows[i];
          const cells = await row.findElements(By.css("td"));

          const project_developer = await cells[0].getText();
          const project_name = await cells[1].getText();
          const vintage = await cells[2].getText();
          const destruction_facility = await cells[3].getText();
          const cod_identification_number = await cells[4].getText();
          const generator_facility_name = await cells[5].getText();
          const destruction_start_date = await cells[6].getText();
          const destruction_end_date = await cells[7].getText();
          const amount_destroyed = await cells[8].getText();

          await saveJSONToFile(
            {
              project_developer: project_developer,
              project_name: project_name,
              vintage: vintage,
              destruction_facility: destruction_facility,
              cod_identification_number: cod_identification_number,
              generator_facility_name: generator_facility_name,
              destruction_start_date: destruction_start_date,
              destruction_end_date: destruction_end_date,
              amount_destroyed: amount_destroyed,
            },
            `./ODS_projects_of_destruction_details/${cod_identification_number}.json`
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

getODS_projects_of_destruction();
