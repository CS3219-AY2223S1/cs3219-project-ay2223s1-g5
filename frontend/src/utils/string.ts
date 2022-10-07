export const nameToInitials = (name: string | undefined) => {
  if (!name) {
    return " ";
  }
  const firstLetter = name.split(" ")[0][0];
  const secondLetter = name.split(" ")[1]?.[0];
  return `${firstLetter}${secondLetter ?? ""}`;
};
