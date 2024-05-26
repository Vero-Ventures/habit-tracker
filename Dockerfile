# Use a base image with a supported Node.js version
FROM node:22.1.0

# Set the node environment, default to production
ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

# Add in your own IP that was assigned by EXPO for your local machine
ENV REACT_NATIVE_PACKAGER_HOSTNAME="10.0.0.19"

# Install global packages
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV PATH /home/node/.npm-global/bin:$PATH
# ENV PATH /app/node_modules/.bin:$PATH

# Create and set permissions for the application directory
RUN mkdir /app && chown root:root /app
WORKDIR /app

# Copy package.json
COPY package.json ./

# Install dependencies without running the prepare script
RUN npm install --ignore-scripts

# Copy the rest of the application code
COPY . ./

# Expose the specified port
EXPOSE 8081

# Command to start the application
CMD npx expo start
