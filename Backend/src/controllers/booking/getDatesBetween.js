export const getDatesBetween = (start, end) => {
  const dates = [];
  let current = new Date(start);

  while (current < new Date(end)) {
    dates.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }

  return dates;
};
