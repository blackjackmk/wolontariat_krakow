# Base stage for dependencies
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./

# Dev stage
FROM base AS dev
RUN npm install --include=dev
COPY . .
CMD ["npm", "run", "dev"]

# Prod stage
FROM base AS prod
RUN npm install
COPY . .
RUN npm run build
RUN npm install -g serve
CMD ["serve", "-s", "dist", "-l", "3000"]
