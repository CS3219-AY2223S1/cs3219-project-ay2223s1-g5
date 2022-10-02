import logging
import sys
from enum import Enum
from json import load
from os import environ as environment
from typing import Dict, List

from dotenv import load_dotenv
from psycopg import Cursor, connect


class Difficulty(Enum):
    EASY = "EASY"
    MEDIUM = "MEDIUM"
    HARD = "HARD"


class Language(Enum):
    # Keys follow our naming convention
    # Values follow LeetCode's naming convention
    CPP = "C++"
    Python = "Python3"
    Javascript = "JavaScript"
    Java = "Java"


class TestCase:
    def __init__(self, inputs, output):
        self.inputs = inputs
        self.output = output


class Question:
    def extract_title(question) -> str:
        return question["title"]

    def extract_description(question) -> str:
        return question["content"]

    def extract_category(question) -> str:
        return question["categoryTitle"]

    def extract_topics(question) -> List[str]:
        topics = []
        for topic in question["topicTags"]:
            topics.append(topic["name"])
        return topics

    def extract_difficulty(question) -> Difficulty:
        difficulty: str = question['difficulty']
        return Difficulty(difficulty.upper())

    def extract_testcase(question) -> TestCase:
        inputs = question["sampleTestCase"]
        output = question["output"]
        return TestCase(inputs, output)

    def extract_hints(question) -> List[str]:
        return question["hints"]

    def extract_templates(question) -> Dict[Language, str]:
        templates = {}
        for template in question['codeSnippets']:
            language = Language(template['lang'])
            code = template['code']
            templates[language] = code
        return templates

    def __init__(self, entry):
        question = entry["data"]["question"]
        self.title: str = Question.extract_title(question)
        self.description: str = Question.extract_description(question)
        self.category: str = Question.extract_category(question)
        self.topics = Question.extract_topics(question)
        self.difficulty: str = Question.extract_difficulty(question)
        self.hints = Question.extract_hints(question)
        self.testcase = Question.extract_testcase(question)
        self.templates = Question.extract_templates(question)


def process_categories(questions: List[Question], cursor: Cursor) -> Dict[str, int]:
    categories = {}
    count = 0
    for question in questions:
        categories[question.category] = 0
    for category in categories:
        cursor.execute("SELECT id FROM \"Category\" WHERE title = %s", [category])
        result = cursor.fetchone()
        if (result is not None):
            categories[category] = result[0]
            logging.info("Existing category: %s has ID %s." % (category, result[0]))
            continue
        cursor.execute("INSERT INTO \"Category\" (title) VALUES (%s) RETURNING id", [category])
        result = cursor.fetchone()
        categories[category] = result[0]
        count += 1
        logging.info("Inserted category: %s has ID %s." % (category, result[0]))
    return [categories, count]


def process_topics(questions: List[Question], cursor: Cursor):
    topics = {}
    count = 0
    for question in questions:
        for topic in question.topics:
            topics[topic] = 0
    for topic in topics:
        cursor.execute("SELECT id FROM \"Topic\" WHERE name = %s", [topic])
        result = cursor.fetchone()
        if (result is not None):
            topics[topic] = result[0]
            logging.info("Existing topic: %s has ID %s." % (topic, result[0]))
            continue
        cursor.execute("INSERT INTO \"Topic\" (name) VALUES (%s) RETURNING id", [topic])
        result = cursor.fetchone()
        topics[topic] = result[0]
        count += 1
        logging.info("Inserted topic: %s has ID %s." %
                     (topic, result[0]))
    return [topics, count]


def process_questions(questions: List[Question], cursor: Cursor, categories, topics):
    count = 0
    for question in questions:
        cursor.execute("SELECT id FROM \"Question\" WHERE title = %s", [question.title])
        result = cursor.fetchone()
        if (result is not None):
            logging.info("Existing question: %s has ID %s." % (question.title, result[0]))
            continue
        category_id = categories[question.category]
        cursor.execute("INSERT INTO \"Question\" (title, difficulty, \"categoryId\", description, hints) VALUES (%s, %s, %s, %s, %s) RETURNING id",
                       [question.title, question.difficulty, category_id, question.description, question.hints])
        question_id = cursor.fetchone()[0]
        for topic in question.topics:
            topic_id = topics[topic]
            cursor.execute("INSERT INTO \"_QuestionToTopic\" (\"A\", \"B\") VALUES (%s, %s)",
                           [question_id, topic_id])
        cursor.execute("INSERT INTO \"TestCases\" (inputs, output, \"questionId\") VALUES (%s, %s, %s)",
                       [question.testcase.inputs, question.testcase.output, question_id])
        for language in question.templates:
            cursor.execute("INSERT INTO \"SolutionTemplate\" (language, code, \"questionId\") VALUES (%s, %s, %s)",
                           [language.name.upper(), question.templates[language], question_id])
        count += 1
        logging.info("Inserted question: %s has ID %s." % (question.title, question_id))
    return count


def process(data):
    questions = []
    for entry in data:
        questions.append(Question(entry))
    try:
        host = environment["DATABASE_HOST"]
        port = environment["DATABASE_PORT"]
        database = environment["DATABASE_NAME"]
        user = environment["DATABASE_USERNAME"]
        password = environment["DATABASE_PASSWORD"]
    except Exception as error:
        logging.error("Database connection settings unavailable. (%s)" % error)
        exit(1)
    try:
        with connect(host=host, port=port, dbname=database, user=user, password=password) as connection:
            with connection.cursor() as cursor:
                [categories, new_category_count] = (process_categories(questions, cursor))
                [topics, new_topic_count] = (process_topics(questions, cursor))
                new_question_count = process_questions(questions, cursor, categories, topics)
                logging.info("[Summary] New categories: %s | New topics: %s | New questions: %s" %
                             (new_category_count, new_topic_count, new_question_count))
    except Exception as error:
        logging.info(error)


def usage(name: str):
    logging.warn("Usage: %s <file> [<environment file>]\n" % (name))


if __name__ == "__main__":
    logging.basicConfig(
        format="[%(process)d] %(asctime)s (%(levelname)s): %(message)s",
        level=logging.INFO
    )
    if len(sys.argv) < 2 or len(sys.argv) > 3:
        usage(sys.argv[0])
        exit(255)
    filename = sys.argv[1]
    if len(sys.argv) == 3:
        load_dotenv(sys.argv[2])
    else:
        load_dotenv()
    data = None
    with open(filename, "r") as file:
        data = load(file)
    if data is None:
        logging.error("Could not parse file.")
        exit(1)
    process(data)
