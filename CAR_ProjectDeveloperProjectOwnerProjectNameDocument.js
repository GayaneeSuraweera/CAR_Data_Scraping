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

let projectDeveloperList = [];
let projectOwnerList = [];
let projectNameList = [];
let projectDocumentList = [];
let projectDataList = [];

async function CAR_webscraping() {
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
          const projectId = getProjectId(await cells[0].getText());
          const anchorElement = await cells[3].findElement(By.css("a"));
          const project_developer = await anchorElement.getAttribute("href");
          const anchorElement2 = await cells[4].findElement(By.css("a"));
          const project_owner = await anchorElement2.getAttribute("href");
          const anchorElement3 = await cells[5].findElement(By.css("a"));
          const project_name = await anchorElement3.getAttribute("href");
          const document = await getHrefAttribute2(cells[22], driver);
          const data = await getHrefAttribute2(cells[23], driver);

          projectDeveloperList.push({ projectId, project_developer });
          projectOwnerList.push({ projectId, project_owner });
          console.log(projectId);
          projectNameList.push({ projectId, project_name });
          projectDocumentList.push({ projectId, document });

          projectDataList.push({ projectId, data });
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
async function getProjectDeveloperDetails(list) {
  let driver = await new Builder().forBrowser("chrome").build();

  try {
    for (const projectDeveloperDetails of list) {
      let projectId = projectDeveloperDetails.projectId; // Corrected
      let projectDeveloperLink = projectDeveloperDetails.project_developer; // Corrected
      await driver.get(projectDeveloperLink);
      const rows = await driver.findElements(
        By.xpath("/html/body/form/table/tbody/tr")
      );

      // Initialize an empty object to store the table data
      const tableData = {};

      // Iterate over each row of the table
      for (const row of rows) {
        // Find cells in the current row
        const cells = await row.findElements(By.css("td"));

        // Ensure there are exactly two cells (two-column table)
        if (cells.length === 2) {
          // Extract text content from the cells
          const key = await cells[0].getText();
          const value = await cells[1].getText();

          const snakeCaseKey = key.replace(/\s+/g, "_").toLowerCase();
          // Store key-value pair in the tableData object
          tableData[snakeCaseKey] = value;
        }
      }
      fs.writeFileSync(
        `./developer_details/${projectId}.json`,
        JSON.stringify(tableData)
      );
    }
  } catch (error) {
    console.error(error);
  } finally {
    await driver.quit();
  }
}
async function getProjectOwnerDetails(list) {
  let driver = await new Builder().forBrowser("chrome").build();

  try {
    for (const projectOwnerDetails of list) {
      let projectId = projectOwnerDetails.projectId; // Corrected
      let projectOwnerLink = projectOwnerDetails.project_owner; // Corrected
      await driver.get(projectOwnerLink);
      const rows = await driver.findElements(
        By.xpath("/html/body/form/table/tbody/tr")
      );

      // Initialize an empty object to store the table data
      const tableData = {};

      // Iterate over each row of the table
      for (const row of rows) {
        // Find cells in the current row
        const cells = await row.findElements(By.css("td"));

        // Ensure there are exactly two cells (two-column table)
        if (cells.length === 2) {
          // Extract text content from the cells
          const key = await cells[0].getText();
          const value = await cells[1].getText();

          const snakeCaseKey = key.replace(/\s+/g, "_").toLowerCase();
          // Store key-value pair in the tableData object
          tableData[snakeCaseKey] = value;
        }
      }
      fs.writeFileSync(
        `./project_owner_details/${projectId}.json`,
        JSON.stringify(tableData)
      );
    }
  } catch (error) {
    console.error(error);
  } finally {
    await driver.quit();
  }
}
async function getProjectNameDetails(list) {
  let driver = await new Builder().forBrowser("chrome").build();

  try {
    for (const projectNameDetails of list) {
      let projectId = projectNameDetails.projectId; // Corrected
      let projectNameLink = projectNameDetails.project_name; // Corrected
      await driver.get(projectNameLink);
      const rows = await driver.findElements(
        By.xpath("/html/body/form/table/tbody/tr")
      );

      // Initialize an empty object to store the table data
      const tableData = {};

      // Iterate over each row of the table
      for (const row of rows) {
        // Find cells in the current row
        const cells = await row.findElements(By.css("td"));

        // Ensure there are exactly two cells (two-column table)
        if (cells.length === 2) {
          // Extract text content from the cells
          const key = await cells[0].getText();
          const value = await cells[1].getText();

          const snakeCaseKey = key.replace(/\s+/g, "_").toLowerCase();
          // Store key-value pair in the tableData object
          tableData[snakeCaseKey] = value;
        }
      }
      fs.writeFileSync(
        `./project_name_details/${projectId}.json`,
        JSON.stringify(tableData)
      );
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
    // If anchor element not found, get the column data directly
    const columnData = await cell.getText();
    return columnData;
  }
}
async function getHrefAttribute2(cell, driver) {
  try {
    const anchorElement = await cell.findElement(By.css("a"));
    return await anchorElement.getAttribute("href");
  } catch (error) {
    // If anchor element not found, return empty string
    return "";
  }
}

async function getDataDetails(list) {
  let driver = await new Builder().forBrowser("chrome").build();
  try {
    for (const projectDataDetails of list) {
      let projectId = projectDataDetails.projectId;
      let projectdataLinks = projectDataDetails.data;
      if (projectdataLinks === "") {
        // Skip processing if document link is empty
        console.log(
          `Skipping empty document link for project ID: ${projectId}`
        );
        continue;
      }
      await driver.get(projectdataLinks);
      const table = await driver.findElement(
        By.xpath(
          "/html/body/table[2]/tbody/tr/td/form/table/tbody/tr[2]/td/table/tbody"
        )
      );
      const rows = await table.findElements(By.css("tr"));
      // Extract the header row to use as keys in the JSON object
      const headerRow = rows[0]; // Select the fourth row (index 3) as the header row
      const headerCells = await headerRow.findElements(By.css("td"));
      const keys = [];
      for (let cell of headerCells) {
        const key = await cell.getText();
        const snakeCaseKey = key.replace(/\s+/g, "_").toLowerCase();
        keys.push(snakeCaseKey);
      }
      // Iterate over each row starting from the fifth row
      const tableData = [];
      for (let i = 1; i < rows.length; i++) {
        // Start from index 4 to skip the header rows
        const rowCells = await rows[i].findElements(By.css("td"));
        const rowData = {};
        for (let j = 0; j < keys.length; j++) {
          // Add error handling to ensure the cell content is properly retrieved
          try {
            const value = await rowCells[j].getText();
            rowData[keys[j]] = value;
          } catch (error) {
            console.error("Error retrieving cell content:", error);
          }
        }
        tableData.push(rowData);
      }
      // Write the tableData array to a JSON file
      fs.writeFileSync(
        `./data_details/${projectId}.json`,
        JSON.stringify(tableData)
      );
    }
    // Find the table rows directly
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await driver.quit();
  }
}
async function getDocumentDetails(list) {
  let driver = await new Builder().forBrowser("chrome").build();
  try {
    for (const projectdocumentDetails of list) {
      let projectId = projectdocumentDetails.projectId;
      let projectdocumentLinks = projectdocumentDetails.document;
      if (projectdocumentLinks === "") {
        // Skip processing if document link is empty
        console.log(
          `Skipping empty document link for project ID: ${projectId}`
        );
        continue;
      }
      await driver.get(projectdocumentLinks);
      const table = await driver.findElement(
        By.xpath(
          "/html/body/table[2]/tbody/tr[4]/td/form/table/tbody/tr/td/table/tbody"
        )
      );
      const rows = await table.findElements(By.css("tr"));
      console.log(rows);
      // Extract the header row to use as keys in the JSON object
      const headerRow = rows[0]; // Select the fourth row (index 3) as the header row
      const headerCells = await headerRow.findElements(By.css("td"));
      const keys = [];
      for (let cell of headerCells) {
        let key = await cell.getText();
        key = key.trim(); // Remove trailing spaces from the key
        const snakeCaseKey = key.replace(/\s+/g, "_").toLowerCase();
        keys.push(snakeCaseKey);
      }
      // Iterate over each row starting from the fifth row
      const tableData = [];
      for (let i = 1; i < rows.length; i++) {
        // Start from index 4 to skip the header rows
        const rowCells = await rows[i].findElements(By.css("td"));
        const rowData = {};
        for (let j = 0; j < keys.length; j++) {
          // Add error handling to ensure the cell content is properly retrieved
          try {
            let value = await getCellData(rowCells[j], driver);
            rowData[keys[j]] = value;
          } catch (error) {
            console.error("Error retrieving cell content:", error);
          }
        }
        tableData.push(rowData);
      }
      // Write the tableData array to a JSON file
      fs.writeFileSync(
        `./project_document_details/${projectId}.json`,
        JSON.stringify(tableData)
      );
    }
    // Find the table rows directly
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await driver.quit();
  }
}
async function getCellData(cell, driver) {
  try {
    const anchorElement = await cell.findElement(By.css("a"));
    const href = await anchorElement.getAttribute("href");
    const text = await anchorElement.getText();
    return { href, text };
  } catch (error) {
    // If anchor element not found, get the column data directly
    const columnData = await cell.getText();
    return { text: columnData };
  }
}
async function runScrapingAndDetails() {
  await CAR_webscraping();
  // await getProjectDeveloperDetails(projectDeveloperList);
  // await getProjectOwnerDetails(projectOwnerList);
  // await getProjectNameDetails(projectNameList);
  // // Filter out entries with empty document links
  // const filteredProjectDataList = projectDataList.filter(
  //   (item) => item.data !== ""
  // );

  // await getDataDetails(filteredProjectDataList);

  // Filter out entries with empty document links
  const filteredProjectDocumentList = projectDocumentList.filter(
    (item) => item.document !== ""
  );

  await getDocumentDetails(filteredProjectDocumentList);
}

runScrapingAndDetails();
