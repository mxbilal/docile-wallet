exports.compareDates = (date1ISO, date2ISO) => {
  const date1 = new Date(date1ISO);
  const date2 = new Date(date2ISO);
  const differenceInTime = Math.abs(date2 - date1);
  const differenceInDays = differenceInTime / (1000 * 60 * 60 * 24);
  const differenceInMonths = differenceInDays / 30; 
  if (differenceInMonths < 1) {
    return true
  } else {
    return false
  }
}