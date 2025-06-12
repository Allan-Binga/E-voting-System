# Base image
FROM node:22-alpine AS builder

# Working directory
WORKDIR /app/client

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci --production  # Use npm ci for reproducible builds

# Copy source code
COPY . .

# Multi-stage build
FROM node:22-alpine

WORKDIR /app/client

# Copy only necessary files from builder
COPY --from=builder /app/client/node_modules ./node_modules
COPY --from=builder /app/client/package*.json ./
COPY --from=builder /app/client/src ./src  
COPY --from=builder /app/client/public ./public  

# Expose port (optional, for documentation)
EXPOSE 5173

# Start command
CMD ["npm", "run", "dev"]