FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
EXPOSE 4000
CMD ["node", "server.js"]

# build : docker build -t protigga-backend .
# run : docker run -p 4000:4000 --name protigga-container protigga-backend