import { ExpandMore } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import DOMPurify from "dompurify";
import parse from "html-react-parser";

export const Question = () => {
  /* Question Content */
  const title = "Two Sum";
  const content =
    "<p>Given an array of integers <code>nums</code>&nbsp;and an integer <code>target</code>, return <em>indices of the two numbers such that they add up to <code>target</code></em>.</p>\n\n<p>You may assume that each input would have <strong><em>exactly</em> one solution</strong>, and you may not use the <em>same</em> element twice.</p>\n\n<p>You can return the answer in any order.</p>\n\n<p>&nbsp;</p>\n<p><strong>Example 1:</strong></p>\n\n<pre>\n<strong>Input:</strong> nums = [2,7,11,15], target = 9\n<strong>Output:</strong> [0,1]\n<strong>Explanation:</strong> Because nums[0] + nums[1] == 9, we return [0, 1].\n</pre>\n\n<p><strong>Example 2:</strong></p>\n\n<pre>\n<strong>Input:</strong> nums = [3,2,4], target = 6\n<strong>Output:</strong> [1,2]\n</pre>\n\n<p><strong>Example 3:</strong></p>\n\n<pre>\n<strong>Input:</strong> nums = [3,3], target = 6\n<strong>Output:</strong> [0,1]\n</pre>\n\n<p>&nbsp;</p>\n<p><strong>Constraints:</strong></p>\n\n<ul>\n\t<li><code>2 &lt;= nums.length &lt;= 10<sup>4</sup></code></li>\n\t<li><code>-10<sup>9</sup> &lt;= nums[i] &lt;= 10<sup>9</sup></code></li>\n\t<li><code>-10<sup>9</sup> &lt;= target &lt;= 10<sup>9</sup></code></li>\n\t<li><strong>Only one valid answer exists.</strong></li>\n</ul>\n\n<p>&nbsp;</p>\n<strong>Follow-up:&nbsp;</strong>Can you come up with an algorithm that is less than&nbsp;<code>O(n<sup>2</sup>)&nbsp;</code>time complexity?";
  const hints = [
    "A really brute force way would be to search for all possible pairs of numbers but that would be too slow. Again, it's best to try out brute force solutions for just for completeness. It is from these brute force solutions that you can come up with optimizations.",
    "So, if we fix one of the numbers, say <code>x</code>, we have to scan the entire array to find the next number <code>y</code> which is <code>value - x</code> where value is the input parameter. Can we change our array somehow so that this search becomes faster?",
    "The second train of thought is, without changing the array, can we use additional space somehow? Like maybe a hash map to speed up the search?",
  ];

  return (
    <Stack
      direction="column"
      spacing={3}
      sx={{
        px: 1, // Padding between scrollbar and content.
        flex: 1,
        height: "100%",
        minHeight: 0,
        overflowX: "hidden",
        overflowY: "auto",
      }}
    >
      <Typography variant="h5" sx={{ textAlign: "center" }}>
        {title}
      </Typography>
      <Divider />
      <Typography
        component={"span"}
        variant="body2"
        sx={{ textAlign: "justify" }}
      >
        {parse(DOMPurify.sanitize(content))}
      </Typography>
      <Stack direction="column">
        {hints.map((hint, number) => (
          <Accordion
            key={number}
            sx={{
              boxShadow: "none",
              "& .MuiAccordionSummary-root": { p: 0 },
            }}
          >
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography>Hint {number + 1}</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              <Typography component={"span"} variant="body2">
                {parse(DOMPurify.sanitize(hint))}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Stack>
    </Stack>
  );
};
