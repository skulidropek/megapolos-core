FROM node:18
RUN apt-get update && apt-get install -y git
RUN npm install -g ts-node
WORKDIR /app
COPY package.json package.json
RUN npm install
COPY . .
RUN cp src/domain/config/config.docker.ts src/domain/config/config.ts
CMD ts-node index.ts