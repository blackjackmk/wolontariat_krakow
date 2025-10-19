# Common base with build args
FROM node:18-alpine as base

WORKDIR /app

# Build arguments
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Copy package files
COPY package*.json ./

EXPOSE 3000

# Development stage
FROM base as dev
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

RUN npm install --frozen-lockfile

COPY . .

CMD ["npm", "run", "dev"]

# Production build stage
FROM base as production

RUN npm ci --only=production

COPY . .
RUN npm run build

CMD ["npm", "run", "preview"]
