import { existsSync, readFileSync } from "fs";

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
  }
  console.log("Starting data processing");
  const processed = await processFunction(questions);
  console.log("Completed data processing");
  console.log("Starting ingest");
  await ingest(processed);
  console.log("Completed ingest");
};

entry();
