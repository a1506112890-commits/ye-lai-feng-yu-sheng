FROM firfe/noname:web-1.10.17.4.1 AS noname_web
FROM firfe/noname:server-1.10.17.4.1 AS noname_server

FROM node:22.21.1-alpine3.22

WORKDIR /app

# The already-built browser client from the working noname-docker project.
COPY --from=noname_web /public /app/public

# The already-built native Noname lobby/WebSocket server.
COPY --from=noname_server /app/game /app/noname-server/game
COPY character/diy /app/public/character/diy
COPY image/character /app/public/image/character
COPY package.json /app/package.json
COPY gateway.cjs /app/gateway.cjs
COPY patch-client.cjs /app/patch-client.cjs

RUN npm config set registry https://registry.npmmirror.com \
    && npm install --omit=dev \
    && cd /app/noname-server \
    && npm init -y >/dev/null 2>&1 \
    && npm install --omit=dev ws@1.0.1 \
    && node /app/patch-client.cjs

ENV NODE_ENV=production

# Render supplies PORT (normally 10000). 8080 stays private inside the same container.
EXPOSE 10000

CMD ["node", "gateway.cjs"]
