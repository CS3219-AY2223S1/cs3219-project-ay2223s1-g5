import { PrismaClient } from "@prisma/client";

import { ProcessedQuestion } from "./types";

export const ingest = async (questions: ProcessedQuestion[]): Promise<void> => {
  const prisma = new PrismaClient();
  const categories = new Set<string>();
  const topics = new Set<string>();

  for (const question of questions) {
    categories.add(question.categoryTitle);
    question.topicTags.forEach((topic) => topics.add(topic.name));
  }

  for (const category of categories) {
    const exists = await prisma.category.findFirst({
      where: { title: category },
    });
    if (exists) {
      console.log(`Existing category: ${category} has ID ${exists.id}`);
      continue;
    }
    try {
      await prisma.category.create({
        data: { title: category },
      });
    } catch (e) {
      console.error(e);
    }
  }

  for (const topic of topics) {
    const exists = await prisma.topic.findFirst({
      where: { name: topic },
    });
    if (exists) {
      console.log(`Existing topic: ${topic} has ID ${exists.id}`);
      continue;
    }
    try {
      await prisma.topic.create({
        data: { name: topic },
      });
    } catch (e) {
      console.error(e);
    }
  }
  for (const question of questions) {
    const exists = await prisma.question.findFirst({
      where: { title: question.title },
    });
    if (exists) {
      console.log(`Existing question: ${question.title} has ID ${exists.id}`);
      continue;
    }
    await prisma.question.create({
      data: {
        title: question.title,
        difficulty: question.difficulty,
        description: question.content,
        hints: question.hints.length ? question.hints : undefined,
        category: {
          connect: {
            title: question.categoryTitle,
          },
        },
        topics: {
          connect: question.topicTags.map((topic) => ({ name: topic.name })),
        },
        testcases: {
          create: {
            inputs: question.testcase.inputs,
            output: question.testcase.output,
          },
        },
        templates: {
          createMany: {
            data: question.codeSnippets.map((snippet) => ({
              language: snippet.lang,
              code: snippet.code,
            })),
          },
        },
      },
    });
  }
};
