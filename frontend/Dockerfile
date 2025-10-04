# Frontend Dockerfile
FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build for production
RUN npm run build

# Serve static files
RUN npm install -g serve
CMD ["serve", "-s", "build", "-l", "3000"]

