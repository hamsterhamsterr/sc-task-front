# Step 1: Build stage
FROM node:20.6.0-alpine3.18 AS build-stage
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build --prod

# Step 2:
FROM nginx:alpine3.18
COPY --from=build-stage /app/dist/organic-shop /usr/share/nginx/html