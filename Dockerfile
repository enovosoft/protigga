FROM node:18-alpine

WORKDIR /app


COPY package*.json ./


RUN npm install

COPY . .

ENV DATABASE_URL="mysql://protigga:rashedul2004@mysql-protigga.alwaysdata.net:3306/protigga_momit"


RUN npx prisma generate
RUN npx prisma db push

EXPOSE 4000

CMD ["npm", "start"]


# build : docker build -t protigga-backend .
# run : docker run -p 4000:4000 --name protigga-container protigga-backend