FROM node:16-alpine as build

WORKDIR /opt/codecollab
COPY . ./
COPY ./.env.prod ./.env
RUN npm ci \
  && npm run prisma:gen \
  && npm run on-serverless build \
  && npm prune --production

FROM node:16-alpine
WORKDIR /opt/codecollab

COPY --from=build /opt/codecollab/serverless ./serverless
COPY --from=build /opt/codecollab/node_modules ./node_modules
COPY --from=build /opt/codecollab/prisma/schema.prisma ./prisma
COPY --from=build /opt/codecollab/package.json ./
COPY --from=build /opt/codecollab/.env ./

EXPOSE 8080
CMD ["npm", "run", "on-serverless", "start"]
