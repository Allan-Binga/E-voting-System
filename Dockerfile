# Base image
FROM node:22-slim AS builder

# Working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci --production  

# Copy source code
COPY . .

# Multi-stage build
FROM node:22-slim

# Update package index and upgrade packages to reduce vulnerabilities
# RUN apk update && apk upgrade

WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app .

# Expose port (optional, for documentation)
EXPOSE 6300

# Start command
CMD ["npm", "start"]