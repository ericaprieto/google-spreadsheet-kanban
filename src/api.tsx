let inited = false;

const CLIENT_ID = process.env.REACT_APP_CLIENT_ID as string;
const API_KEY = process.env.REACT_APP_API_KEY as string;
const SPREADSHEET_ID = process.env.REACT_APP_SPREADSHEET_ID as string;

export interface Color {
  red: number;
  green: number;
  blue: number;
}

export interface Cell {
  value: string;
  color: Color;
}

function init(onStatusChange: (loggedIn: boolean) => void) {
  if (inited) {
    return Promise.reject("api already inited");
  }

  inited = true;

  return new Promise((resolve, reject) => {
    gapi.load("client:auth2", () => {
      gapi.client
        .init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          discoveryDocs: [
            "https://sheets.googleapis.com/$discovery/rest?version=v4",
          ],
          scope: "https://www.googleapis.com/auth/spreadsheets",
        })
        .then(
          () => {
            gapi.auth2.getAuthInstance().isSignedIn.listen(onStatusChange);
            onStatusChange(gapi.auth2.getAuthInstance().isSignedIn.get());
            resolve();
          },
          (error) => {
            inited = false;
            reject(error);
          }
        );
    });
  });
}

function signIn() {
  gapi.auth2.getAuthInstance().signIn();
}

function signOut() {
  gapi.auth2.getAuthInstance().signOut();
}

function listSheets() {
  return gapi.client.sheets.spreadsheets
    .get({ spreadsheetId: SPREADSHEET_ID })
    .then((response) => response.result.sheets || [])
    .then((sheets) =>
      sheets
        .map((sheet) => ({
          id: sheet.properties?.sheetId as number,
          title: sheet.properties?.title as string,
        }))
        .filter((sheet) => sheet.id && sheet.title)
    );
}

function getRows(sheet: string): Promise<Cell[][]> {
  return gapi.client.sheets.spreadsheets
    .get({
      spreadsheetId: SPREADSHEET_ID,
      ranges: [sheet],
      includeGridData: true,
    })
    .then((response: any) =>
      response.result.sheets[0].data[0].rowData
        .reduce((acc: any, rowData: any) => [...acc, rowData], [])
        .map((rowData: any) =>
          rowData.values.map((value: any) => ({
            value: value.formattedValue,
            color: value.effectiveFormat?.backgroundColor,
          }))
        )
    );
}

function indexToSpreadsheetColumn(num: number) {
  let s = "";
  let t;

  num++;

  while (num > 0) {
    t = (num - 1) % 26;
    s = String.fromCharCode(65 + t) + s;
    num = ((num - t) / 26) | 0;
  }

  return s;
}

function updateCell(
  sheet: string,
  columnIndex: number,
  rowIndex: number,
  value: number | string
) {
  const range = `${sheet}!${indexToSpreadsheetColumn(columnIndex)}${
    rowIndex + 1
  }`;

  return gapi.client.sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range,
    valueInputOption: "USER_ENTERED",
    values: [[value]],
  } as any);
}

function updateCells(sheet: string, data: [number, number, number | string][]) {
  return gapi.client.sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    valueInputOption: "USER_ENTERED",
    data: data.map(([columnIndex, rowIndex, value]) => ({
      range: `${sheet}!${indexToSpreadsheetColumn(columnIndex)}${rowIndex + 1}`,
      values: [[value]],
    })),
  } as any);
}

function insertRowAfter(sheet: string, rowIndex: number) {
  return gapi.client.sheets.spreadsheets
    .get({
      spreadsheetId: SPREADSHEET_ID,
      ranges: [sheet],
    })
    .then(
      (response: any) => response.result.sheets[0].properties.sheetId as number
    )
    .then((sheetId) => {
      return gapi.client.sheets.spreadsheets
        .batchUpdate(
          {
            spreadsheetId: SPREADSHEET_ID,
          },
          {
            requests: [
              {
                insertDimension: {
                  range: {
                    sheetId,
                    dimension: "ROWS",
                    startIndex: 1,
                    endIndex: 2,
                  },
                },
              },
              {
                moveDimension: {
                  source: {
                    sheetId,
                    dimension: "ROWS",
                    startIndex: 1,
                    endIndex: 2,
                  },
                  destinationIndex: rowIndex + 2,
                },
              },
            ],
          }
        )
        .then(() => rowIndex + 1);
    });
}

function setRowColor(sheet: string, rowIndex: number, color: Color) {
  return gapi.client.sheets.spreadsheets
    .get({
      spreadsheetId: SPREADSHEET_ID,
      ranges: [sheet],
    })
    .then(
      (response: any) => response.result.sheets[0].properties.sheetId as number
    )
    .then((sheetId) => {
      return gapi.client.sheets.spreadsheets.batchUpdate(
        {
          spreadsheetId: SPREADSHEET_ID,
        },
        {
          requests: [
            {
              updateCells: {
                rows: [
                  {
                    values: Array(30)
                      .fill(null)
                      .map(() => ({
                        userEnteredFormat: {
                          backgroundColor: color,
                        },
                      })),
                  },
                ],
                fields: "userEnteredFormat.backgroundColor",
                range: {
                  sheetId: sheetId,
                  startRowIndex: rowIndex,
                  endRowIndex: rowIndex + 1,
                },
              },
            },
          ],
        }
      );
    });
}

const api = {
  init,
  signIn,
  signOut,
  listSheets,
  getRows,
  updateCell,
  updateCells,
  insertRowAfter,
  setRowColor,
};

export default api;
