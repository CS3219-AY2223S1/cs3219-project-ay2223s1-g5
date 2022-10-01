import { Controller } from "@nestjs/common";

import { QuestionService } from "./question.service";

@Controller("questions")
export class QuestionController {
  constructor(private questionService: QuestionService) {}
}
