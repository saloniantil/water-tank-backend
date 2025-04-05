export const createSheetService = (sheets, spreadsheetId) => ({
    updateSheet: async (range, values) => {
      const formattedValues = values.flat();
      return sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: "USER_ENTERED",
        resource: { values: formattedValues },
      });
    },
  
    getSheetData: async (range) => {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });
      return response.data.values || [];
    },
    
    appendStatus: async (values) => {
    return sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'status!A:F',  // Store pump/valve status separately
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        resource: { values: [values] },
    });
  }

});