import { Injectable } from "@nestjs/common";
import { RedisService } from "src/redis/redis.service";

@Injectable()
export class MatchService {
  constructor(private redisService: RedisService) {}
}
