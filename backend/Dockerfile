# --- Backend image: Node + Express API ---
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Install production dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY src ./src

# App listens on 5000 by default (overridable via PORT env)
ENV NODE_ENV=production
EXPOSE 5000

# Run as the built-in non-root user for security
USER node

CMD ["npm", "start"]
