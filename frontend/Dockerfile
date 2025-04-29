# Use Node.js as the base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Expose port 3100 for Kubernetes
EXPOSE 3100

# Start the application with custom port
CMD ["npm", "run", "dev", "--", "--port", "3100", "--host", "0.0.0.0"]