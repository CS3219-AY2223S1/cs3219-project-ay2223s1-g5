import json
import requests
from utils import read_tracker, update_tracker

# # Get upto which problem it is already scraped from track.conf file
# completed_upto = read_tracker("track.conf")

def scrap():
    # Leetcode API URL to get json of problems on algorithms categories
    ALGORITHMS_ENDPOINT_URL = "https://leetcode.com/api/problems/algorithms/"
    algorithms_problems_json = requests.get(url = ALGORITHMS_ENDPOINT_URL).content
    algorithms_problems_json = json.loads(algorithms_problems_json)

    # List to store question_title_slug
    links = []
    for child in algorithms_problems_json["stat_status_pairs"]:
            # Only process free problems
            if not child["paid_only"]:
                question__title_slug = child["stat"]["question__title_slug"]
                question__article__slug = child["stat"]["question__article__slug"]
                question__title = child["stat"]["question__title"]
                frontend_question_id = child["stat"]["frontend_question_id"]
                difficulty = child["difficulty"]["level"]
                links.append((question__title_slug, difficulty, frontend_question_id, question__title, question__article__slug))

    # Sort by frontend qn id
    links = sorted(links, key=lambda x: (x[2]))

    result = []
    for i in range(completed_upto + 1, len(links)):
        question__title_slug, _ , frontend_question_id, question__title, question__article__slug = links[i]
        title = f"{frontend_question_id}. {question__title}"

        # Make API call
        ALGORITHMS_BASE_URL = "https://leetcode.com/graphql/"
        url = ALGORITHMS_BASE_URL + question__title_slug
        body = {
            "operationName": "questionData",
            "variables": {
                "titleSlug": question__title_slug
            },
            "query": "query questionData($titleSlug: String!) {\n  question(titleSlug: $titleSlug) {\n    questionId\n    questionFrontendId\n    title\n    titleSlug\n    content\n  difficulty\n  similarQuestions\n    exampleTestcases\n    categoryTitle\n  topicTags {\n      name\n}\n    companyTagStats\n    codeSnippets {\n      lang\n           code\n        }\n   hints\n  sampleTestCase\n   }\n}\n"
        }
        
        print("Scrapping " + title)
        res = requests.get(url = url, json=body)
        result.append(res.json())
        print("Completed Scrapping " + title)

        # # Update count
        # update_tracker('track.conf', i)
            
    with open("leetcode_questions.json", "w") as json_file:
        json.dump(result, json_file, indent=4, separators=(',',': '))

if __name__ == "__main__":
    scrap()