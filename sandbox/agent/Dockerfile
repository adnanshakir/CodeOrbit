FROM node:20-bullseye

RUN apt-get update && apt-get install -y \
    make \
    python3 \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 3000
RUN mkdir /workspace

CMD ["node", "server.js"]