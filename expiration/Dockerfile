FROM node:alpine

WORKDIR /app
COPY package.json .
# note: --only=prod is necessary,
# so that we do not install heavy dependencies (i.e. mmongodb-memory-server)
# that are used only for testing
RUN npm install --only=prod
COPY . .

CMD ["npm", "run", "start"]
