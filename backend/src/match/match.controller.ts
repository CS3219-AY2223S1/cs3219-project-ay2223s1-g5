import { Controller } from "@nestjs/common";
import { MatchService } from "./match.service";

@Controller("matches")
export class MatchController {
  constructor(private readonly service: MatchService) {}

  // TODO: This class is responsible for finding matches
}
