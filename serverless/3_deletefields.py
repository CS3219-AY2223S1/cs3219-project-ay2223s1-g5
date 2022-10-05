import json

f = open('cleaned_leetcode_questions.json')
data = json.load(f)

languages = [
"Python",
"C", 
"C#",
"Ruby",
"Swift",
"Go",
"Scala",
"Kotlin",
"Rust",
"PHP",
"Racket",
"TypeScript",
"Erlang",
"Elixir",
"Dart",
]

for i in data[:]:

  # Remove TreeNode codes
  if "TreeNode" in i["data"]["question"]["codeSnippets"][0]["code"]:
    data.remove(i)
  else:
    # Remove company stat
    del i["data"]["question"]["companyTagStats"]
    
    # Split test case into String[]
    i["data"]["question"]["sampleTestCase"] = i["data"]["question"]["sampleTestCase"].split("\n")

    # Remove redundant Languages
    # Don't remove items from a list while iterating over it as it will cause skipping of items
    # (Iteration index is not updated for account for elements removed)
    # Hence we create a shallow copy of the list for iteration https://stackoverflow.com/questions/38546951/remove-element-from-list-when-using-enumerate-in-python
    for snippet in i["data"]["question"]["codeSnippets"][:]:
      if snippet["lang"] in languages:
        i["data"]["question"]["codeSnippets"].remove(snippet)

with open("cleaned_leetcode_questions_v2.json", "w") as json_file:
  json.dump(data, json_file, indent=4, separators=(',',': '))
