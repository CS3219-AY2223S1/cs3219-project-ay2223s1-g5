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

import { Center } from "./Center";

import { Status } from "~shared/types/base";

/* Tabular Data */
const tableHeaders = ["DATE", "RUNTIME", "TEST CASE", "STATUS"];
const tableCells = ["2020-04-26 00:26:55", "0.13s", "[2,7,11,15], 9", "Pass"];

export const Submissions = () => {
  return (
    <TableContainer sx={{ flex: 1 }} component={Paper}>
      <Table sx={{ minWidth: "100%" }}>
        <TableHead sx={{ bgcolor: "primary.500" }}>
          <TableRow>
            {tableHeaders.map((tableHeader) => (
              <TableCell
                key={tableHeader}
                align="center"
                sx={{
                  fontWeight: "bold",
                  color: "white",
                }}
              >
                {tableHeader}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            {tableCells.map((tableCell) => (
              <TableCell
                key={tableCell}
                align="center"
                sx={{
                  color:
                    Object.values<string>(Status).includes(tableCell) &&
                    tableCell === "Pass"
                      ? "green.500"
                      : Object.values<string>(Status).includes(tableCell)
                      ? "red.500"
                      : "black",
                  fontWeight: Object.values<string>(Status).includes(tableCell)
                    ? "bold"
                    : "normal",
                }}
              >
                <Center>
                  {Object.values<string>(Status).includes(tableCell) &&
                  tableCell === "Pass" ? (
                    <CheckCircle sx={{ mr: 0.5 }} />
                  ) : Object.values<string>(Status).includes(tableCell) ? (
                    <Cancel sx={{ mr: 0.5 }} />
                  ) : null}
                  {tableCell}
                </Center>
              </TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};
