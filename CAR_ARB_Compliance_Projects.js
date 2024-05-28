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

async function getARB_compliance_projects() {
  let driver = await new Builder().forBrowser("chrome").build();
  try {
    await driver.get(
      "https://thereserve2.apx.com/myModule/rpt/myrpt.asp?r=211"
    );
    while (true) {
      const rows = await driver.findElements(By.xpath("//table/tbody/tr"));
      for (let i = 5; i < rows.length - 4; i++) {
        try {
          const row = rows[i];
          const cells = await row.findElements(By.css("td"));

          const project_id = await cells[0].getText();
          const arb_id = await cells[1].getText();
          const projectId = await getProjectId(await cells[0].getText());
          const cooperative_aggregate_id = await cells[2].getText();
          const project_developer = await cells[3].getText();
          const project_owner = await cells[4].getText();
          const project_name = await cells[5].getText();
          const offset_project_operator = await cells[6].getText();
          const authorized_project_designee = await cells[7].getText();
          const verification_body = await cells[8].getText();
          const project_type = await cells[9].getText();
          const status = await cells[10].getText();
          const arb_project_status = await cells[11].getText();
          const project_site_location = await cells[12].getText();
          const project_site_state = await cells[13].getText();
          const project_site_country = await cells[14].getText();
          const additional_certifications = await cells[15].getText();
          const sdg_impact = await cells[16].getText();
          const project_notes = await cells[17].getText();
          const total_number_of_offset_credits_registered =
            await cells[18].getText();
          const project_listed_date = await cells[19].getText();
          const project_registered_date = await cells[20].getText();
          const documents = await getHrefAttribute(cells[21]);
          const data = await getHrefAttribute(cells[22]);
          const project_website = await getHrefAttribute(cells[23]);
          await saveJSONToFile(
            {
              project_id: project_id,
              arb_id: arb_id,
              cooperative_aggregate_id: cooperative_aggregate_id,
              project_developer: project_developer,
              project_owner: project_owner,
              project_name: project_name,
              offset_project_operator: offset_project_operator,
              authorized_project_designee: authorized_project_designee,
              verification_body: verification_body,
              project_type: project_type,
              status: status,
              arb_project_status: arb_project_status,
              project_site_location: project_site_location,
              project_site_state: project_site_state,
              project_site_country: project_site_country,
              additional_certifications: additional_certifications,
              sdg_impact: sdg_impact,
              project_notes: project_notes,
              total_number_of_offset_credits_registered:
                total_number_of_offset_credits_registered,
              project_listed_date: project_listed_date,
              project_registered_date: project_registered_date,
              documents: documents,
              data: data,
              project_website: project_website,
            },
            `./ARB_compliance_projects_details/${projectId}.json`
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

getARB_compliance_projects();
