# --- Stage 1: build the Vite app ---
FROM node:20-alpine AS build

WORKDIR /app

# VITE_API_URL is baked in at build time (Vite inlines env vars).
# Override with: docker build --build-arg VITE_API_URL=https://your-api/api
ARG VITE_API_URL=http://localhost:5000/api
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Stage 2: serve static files with nginx ---
FROM nginx:1.27-alpine

# SPA routing config (so /login, /register don't 404 on refresh)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built assets
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
