import TextField from "@mui/material/TextField";

interface TextBoxProps {
  label: string;
}

export const TextBox = ({ label }: TextBoxProps) => {
  return (
    <TextField
      label={label}
      variant="outlined"
      size="small"
      sx={{ width: "80%", "& .MuiInputBase-root": { borderRadius: "20px" } }}
    />
  );
};
