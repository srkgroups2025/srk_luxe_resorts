export const getDatesBetween = (start, end) => {
  const dates = [];
  
  let current = new Date(start);
  const checkout = new Date(end);

  // Normalize to start of day (local time)
  current.setHours(0, 0, 0, 0);
  checkout.setHours(0, 0, 0, 0);

  while (current < checkout) {
    // Format as yyyy-mm-dd in LOCAL time
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, "0"); // 0-indexed
    const day = String(current.getDate()).padStart(2, "0");

    dates.push(`${year}-${month}-${day}`);

    current.setDate(current.getDate() + 1);
  }

  return dates;
};
