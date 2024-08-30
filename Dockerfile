FROM node:22.7.0-alpine3.20 AS development

WORKDIR /usr/src/app

COPY package.json /usr/src/app/package.json
COPY package-lock.json /usr/src/app/package-lock.json
RUN npm ci

# CMD node populatedb.js "mongodb://mongo:27017/library"

COPY . /usr/src/app

EXPOSE 3000

CMD ["npm", "run", "dev"]