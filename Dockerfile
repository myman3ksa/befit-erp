# Use the official Nginx image as the base image
FROM nginx:alpine

# Copy the frontend files into the Nginx server's default public directory
# The default directory for Nginx is /usr/share/nginx/html
COPY ./index.html /usr/share/nginx/html/index.html
COPY ./app.js /usr/share/nginx/html/app.js
COPY ./style.css /usr/share/nginx/html/style.css

# Expose port 80 to the outside world
EXPOSE 80

# The default command of the Nginx image already starts the server, 
# so we don't need to specify a CMD instruction.
