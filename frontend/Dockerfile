# Base stage for dependencies
FROM node:18 AS base
WORKDIR /app
COPY package*.json ./
RUN npm install

# Dev stage
FROM base AS dev
COPY . .
CMD ["npm", "run", "dev"]

# Prod stage
FROM base AS prod
COPY . .
RUN npm run build
RUN npm install -g serve
CMD ["serve", "-s", "build", "-l", "3000"]

