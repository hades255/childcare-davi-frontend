export const formatDate = (dateString) => {
  if (!dateString) return "";
  const dateObj = new Date(dateString);

  // getDate(), getMonth(), and getFullYear() return numbers
  let day = dateObj.getDate();
  let month = dateObj.getMonth() + 1; // Months are zero indexed
  const year = dateObj.getFullYear();

  // Pad day and month with leading zero if needed
  day = day < 10 ? "0" + day : day;
  month = month < 10 ? "0" + month : month;

  return `${day}-${month}-${year}`;
};
