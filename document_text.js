const fs = require("fs").promises; // Using promises version of fs for asynchronous file operations
const { By, Builder } = require("selenium-webdriver");
require("selenium-webdriver/chrome");

function getProjectId(data = "") {
  if (data.length) {
    return data.replace("CAR", "");
  }
  return null;
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
let projectDocumentList = [];
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
          const document = await getHrefAttribute2(cells[22], driver);
          console.log(projectId);
          projectDocumentList.push({ projectId, document });
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

// async function getDocumentDetailsWithText(list) {
//   let driver = await new Builder().forBrowser("chrome").build();
//   try {
//     for (const projectdocumentDetails of list) {
//       let projectId = projectdocumentDetails.projectId;
//       let projectdocumentLinks = projectdocumentDetails.document;
//       if (projectdocumentLinks === "") {
//         // Skip processing if document link is empty
//         console.log(
//           `Skipping empty document link for project ID: ${projectId}`
//         );
//         continue;
//       }
//       await driver.get(projectDocumentList);
//       const table = await driver.findElement(
//         By.xpath(
//           "/html/body/table[2]/tbody/tr[4]/td/form/table/tbody/tr/td/table/tbody"
//         )
//       );
//       const rows = await table.findElements(By.css("tr"));
//       console.log(rows);
//       // Extract the header row to use as keys in the JSON object
//       const headerRow = rows[0]; // Select the fourth row (index 3) as the header row
//       const headerCells = await headerRow.findElements(By.css("td"));
//       const keys = [];
//       for (let cell of headerCells) {
//         let key = await cell.getText();
//         key = key.trim(); // Remove trailing spaces from the key
//         const snakeCaseKey = key.replace(/\s+/g, "_").toLowerCase();
//         keys.push(snakeCaseKey);
//       }
//       // Iterate over each row starting from the fifth row
//       const tableData = [];
//       for (let i = 1; i < rows.length; i++) {
//         // Start from index 4 to skip the header rows
//         const rowCells = await rows[i].findElements(By.css("td"));
//         const rowData = {};
//         for (let j = 0; j < keys.length; j++) {
//           // Add error handling to ensure the cell content is properly retrieved
//           try {
//             let value = await getCellData(rowCells[j], driver);
//             rowData[keys[j]] = value;
//           } catch (error) {
//             console.error("Error retrieving cell content:", error);
//           }
//         }
//         tableData.push(rowData);
//       }
//       // Write the tableData array to a JSON file
//       await fs.writeFile(
//         `./Updated_Document_Details/${projectId}.json`,
//         JSON.stringify(tableData)
//       );

//       // Find the table rows directly
//     }
//   } catch (error) {
//     console.error("Error:", error);
//   } finally {
//     await driver.quit();
//   }
// }
async function getDocumentDetailsWithText(list) {
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
      await driver.get(projectdocumentLinks); // Corrected this line
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
      await fs.writeFile(
        `./Updated_Document_Details/${projectId}.json`,
        JSON.stringify(tableData)
      );

      // Find the table rows directly
    }
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

  const filteredProjectDocumentList = projectDocumentList.filter(
    (item) => item.document !== ""
  );

  await getDocumentDetailsWithText(filteredProjectDocumentList);
}

runScrapingAndDetails();
