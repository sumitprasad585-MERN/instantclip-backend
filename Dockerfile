FROM node:20

WORKDIR /app

COPY . /app

RUN npm install

EXPOSE 8888

CMD ["node", "index.js"]
