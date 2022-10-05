# Need to manually clean up further after processing

import json

f = open('leetcode_questions.json')
data = json.load(f)
result = []

for i in data:
  print(i["data"]["question"]["questionId"])
  intermediate = i["data"]["question"]["content"].split("<strong>Output:</strong>", 1)[1]
  output = intermediate.split("\n", 1)[0]
  i["data"]["question"]["output"] = output
  result.append(i)


with open("cleaned_leetcode_questions.json", "w") as json_file:
  json.dump(result, json_file, indent=4, separators=(',',': '))
