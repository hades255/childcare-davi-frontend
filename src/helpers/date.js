export const formatDate = (dateString) => {
  if (!dateString) return "";

  // Try to parse the date string in a safe way
  let dateObj;

  // If input is already a Date object, use it directly
  if (dateString instanceof Date) {
    dateObj = dateString;
  } else {
    // Try to normalize separators to ISO format
    const normalized = dateString
      .replace(/\./g, "-")  // replace dots with dashes
      .replace(/\//g, "-"); // replace slashes with dashes

    // If format is DD-MM-YYYY, convert to YYYY-MM-DD for parsing
    const parts = normalized.split("-");
    if (parts.length === 3 && parts[0].length === 2 && parts[2].length === 4) {
      // Assume DD-MM-YYYY and reformat to YYYY-MM-DD
      dateObj = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    } else {
      dateObj = new Date(normalized);
    }
  }

  if (isNaN(dateObj)) return ""; // invalid date

  let day = dateObj.getDate();
  let month = dateObj.getMonth() + 1; // Months are 0-indexed
  const year = dateObj.getFullYear();

  day = day < 10 ? "0" + day : day;
  month = month < 10 ? "0" + month : month;

  return `${day}-${month}-${year}`;
};
