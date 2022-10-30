import { ReactNode } from "react";
import {
  Paper,
  SxProps,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Theme,
} from "@mui/material";

type DataTableProps = {
  headers: string[];
  rows: (string | { child: ReactNode; sx?: SxProps<Theme> })[][];
};

export const DataTable = ({ headers, rows }: DataTableProps) => {
  return (
    <TableContainer sx={{ boxShadow: "none" }} component={Paper}>
      <Table sx={{ minWidth: "100%" }}>
        <TableHead sx={{ bgcolor: "primary.500" }}>
          <TableRow>
            {headers.map((header) => (
              <TableCell
                key={header}
                align="center"
                sx={{
                  fontWeight: "bold",
                  color: "white",
                }}
              >
                {header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={index}>
              {row.map((cell, cellIndex) =>
                typeof cell === "string" ? (
                  <TableCell key={cell} align="center">
                    {cell}
                  </TableCell>
                ) : (
                  <TableCell
                    key={`${index}|${cellIndex}`}
                    align="center"
                    sx={cell.sx}
                  >
                    {cell.child}
                  </TableCell>
                ),
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
