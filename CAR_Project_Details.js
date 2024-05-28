const fs = require("fs");
const { By, Builder } = require("selenium-webdriver");
require("selenium-webdriver/chrome");

function getProjectId(data = "") {
  if (data.length) {
    return data.replace("CAR", "");
  }
  return null;
}

function saveJSONToFile(jsonContents, fileName) {
  fs.writeFileSync(fileName, jsonContents);
}

async function ACR_webscraping() {
  let driver = await new Builder().forBrowser("chrome").build();
  try {
    await driver.get(
      "https://thereserve2.apx.com/myModule/rpt/myrpt.asp?r=111"
    );
    while (true) {
      const rows = await driver.findElements(By.xpath("//table/tbody/tr"));
      for (let i = 5; i < rows.length - 4; i++) {
        try {
          const row = rows[i];
          const cells = await row.findElements(By.css("td"));
          const project_id = await cells[0].getText();
          const projectId = await getProjectId(await cells[0].getText());
          const arb_id = await cells[1].getText();
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
          const corsia_eligible = await cells[12].getText();
          const project_site_location = await cells[13].getText();
          const project_site_state = await cells[14].getText();
          const project_site_country = await cells[15].getText();
          const additional_certifications = await cells[16].getText();
          const sdg_impact = await cells[17].getText();
          const project_notes = await getHrefAttribute(cells[18], driver);
          const total_number_of_offset_credit_registered =
            await getHrefAttribute(cells[19], driver);
          const project_listed_date = await cells[20].getText();
          const project_registered_date = await cells[21].getText();
          const documents = await getHrefAttribute(cells[22]);
          const data = await getHrefAttribute(cells[23]);
          const project_website = await getHrefAttribute(cells[24], driver);

          saveJSONToFile(
            JSON.stringify({
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
              corsia_eligible: corsia_eligible,
              project_site_location: project_site_location,
              project_site_state: project_site_state,
              project_site_country: project_site_country,
              additional_certifications: additional_certifications,
              sdg_impact: sdg_impact,
              project_notes: project_notes,
              total_number_of_offset_credit_registered:
                total_number_of_offset_credit_registered,
              project_listed_date: project_listed_date,
              project_registered_date: project_registered_date,
              documents: documents,
              data: data,
              project_website: project_website,
            }),
            `./projects/${projectId}.json`
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
    const element = await cell.getText();
    return element;
  }
}

ACR_webscraping();
