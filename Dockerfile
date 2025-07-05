FROM node:18-alpine
WORKDIR /app

ENV PORT 8080
ENV SELF_URL http://localhost:8080

RUN apk add --update python3 make g++ && rm -rf /var/cache/apk/*

COPY package-lock.json ./package-lock.json
COPY package.json ./package.json
COPY tsconfig.json ./tsconfig.json

RUN npm install

COPY assets ./assets
COPY frm ./frm
COPY lib ./lib
COPY migrations ./migrations
COPY src ./src
COPY .env.deploy ./.env
COPY knexfile.js ./knexfile.js

RUN npm run build

CMD ["npm", "start"]
