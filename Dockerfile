FROM node:16-alpine as build

WORKDIR /opt/codecollab
COPY . ./
RUN npm ci \
  && npm run prisma:gen \
  && npm run build \
  && npm prune --production

FROM node:16-alpine
WORKDIR /opt/codecollab

COPY --from=build /opt/codecollab/backend ./backend
COPY --from=build /opt/codecollab/frontend/build ./frontend/build
COPY --from=build /opt/codecollab/shared ./shared
COPY --from=build /opt/codecollab/node_modules ./node_modules
COPY --from=build /opt/codecollab/package.json ./

EXPOSE 8080
CMD ["npm", "run", "on-backend", "start:prod"]
