import { Cancel, CheckCircle } from "@mui/icons-material";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

import { Center } from "../Center";

import { Status } from "~shared/types/base";

type DataTableProps = {
  headers: string[];
  rows: string[][];
};

export const DataTable = ({ headers, rows }: DataTableProps) => {
  return (
    <TableContainer
      sx={{ boxShadow: "none", maxHeight: "300px" }}
      component={Paper}
    >
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
          {rows.map((row) => (
            <TableRow key={row[0]}>
              {row.map((cell) => (
                <TableCell
                  key={cell}
                  align="center"
                  sx={{
                    color:
                      Object.values<string>(Status).includes(cell) &&
                      cell === "Pass"
                        ? "green.500"
                        : Object.values<string>(Status).includes(cell)
                        ? "red.500"
                        : "black",
                    fontWeight: Object.values<string>(Status).includes(cell)
                      ? "bold"
                      : "normal",
                  }}
                >
                  <Center>
                    {Object.values<string>(Status).includes(cell) &&
                    cell === "Pass" ? (
                      <CheckCircle sx={{ mr: 0.5 }} />
                    ) : Object.values<string>(Status).includes(cell) ? (
                      <Cancel sx={{ mr: 0.5 }} />
                    ) : null}
                    {cell}
                  </Center>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
