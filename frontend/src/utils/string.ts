import { format } from "date-fns";

export const nameToInitials = (name: string | undefined) => {
  if (!name) {
    return " ";
  }
  const firstLetter = name.split(" ")[0][0];
  const secondLetter = name.split(" ")[1]?.[0];
  return `${firstLetter}${secondLetter ?? ""}`;
};

export const normaliseStatus = (string?: string) => {
  return (
    string &&
    string
      .split("_")
      .map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")
  );
};

export const formatDate = (date: Date | string) => {
  return format(new Date(date), "h:ma d/M/yy");
};

export const titleCase = (string: string) => {
  return string.charAt(0) + string.slice(1).toLowerCase();
};
