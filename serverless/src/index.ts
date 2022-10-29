import { existsSync, readFileSync, writeFileSync } from "fs";

import { filter } from "./filter";
import { ingest } from "./ingest";
import { process as processFunction } from "./process";
import { scrapper } from "./scrapper";
import { Question } from "./types";

export const entry = async () => {
  let questions: Question[] = [];
  if (process.env.NODE_ENV === "development" && existsSync("questions.json")) {
    console.log("Reading in existing question bank");
    const file = readFileSync("questions.json", "utf-8");
    questions = JSON.parse(file);
    console.log("Completed reading in existing question bank");
  } else {
    console.log("Starting download");
    questions = await scrapper();
    console.log("Completed download");
    if (process.env.NODE_ENV === "development") {
      console.log("Saving question bank");
      const data = JSON.stringify(questions, undefined, 2);
      writeFileSync("questions.json", data);
    }
  }
  console.log("Starting data processing");
  const processed = await processFunction(questions);
  console.log("Completed data processing");
  const filtered = filter(processed);
  console.log("Starting ingest");
  await ingest(filtered);
  console.log("Completed ingest");
};

entry();
