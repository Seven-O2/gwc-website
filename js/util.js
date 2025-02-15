/*
 * This file contains general purpose functions like fetching and parsing a CSV or creating an
 * icon/text container
 */

// Fetches a CSV file and returns a promise that, when fulfilled, contains the dismanteld csv file
// In the end a 2 dimensional array is returned. The first dimension contains the row, the second
// the csv entries.
// VAL1;VAL2;VAL3
// 1111;1112;1113
// 2221;2222;2223
// csv[0][2] returns 1113
export const fetchCSV = async (file) => {
    const response = await fetch(file, { cache: 'no-cache' });
    if (response.status !== 200) {
        throw new Error("Couldn't load data");
    }
    const response_1 = response;
    const data = await response_1.text();
    return data
        .split(/\r\n|\n/)               // Split newlines
        .splice(1)                      // Remove header
        .filter(e => e !== "")          // Remove null lines
        .map(e_1 => e_1.split(";"));    // Split values at semicolons
}

// Creates an icon with text for the passed icon and text
export const getIconWithText = (iconSrc, iconAlt, text) => {
    const icon = document.createElement("img");
    icon.src = iconSrc;
    icon.alt = iconAlt;

    const container = document.createElement("div");
    container.classList.add("icon-with-text");
    container.appendChild(icon)
    container.appendChild(text);
    return container;
}
