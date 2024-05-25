# Use a base image with a supported Node.js version
FROM node:20.5.0

# Set the node environment, default to production
ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

# Default port configuration
ARG PORT=8081
ENV PORT $PORT
EXPOSE 8081

# Add in your own IP that was assigned by EXPO for your local machine
ENV REACT_NATIVE_PACKAGER_HOSTNAME="10.0.0.19"

# Install global packages
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV PATH /home/node/.npm-global/bin:$PATH

# Create and set permissions for the application directory
RUN mkdir /opt/app && chown root:root /opt/app
WORKDIR /opt/app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies without running the prepare script
RUN npm install --ignore-scripts

# Install Husky separately
RUN npm install husky

# Copy the rest of the application code
WORKDIR /opt/app
COPY . /opt/app/

# Expose the specified port
EXPOSE 8081

# Command to start the application
CMD npx expo start --web
