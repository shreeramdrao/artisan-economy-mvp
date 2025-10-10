FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY . .
ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000
HEALTHCHECK CMD curl -f http://localhost:4000/api/health || exit 1
CMD ["npm", "run", "start:prod"]
