FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript
# If you don't have a build script, we can run with ts-node, but building is better.
# Assuming standard TS setup. If no build script, we'll use ts-node-dev or similar in prod (not recommended but works).
# Let's try to build.
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/src/server.js"]