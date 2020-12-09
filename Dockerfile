FROM node:14.15.1 as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY ./ .
RUN npm run build

FROM nginx:1.18.0 as production-stage
COPY nginx.conf /etc/nginx/nginx.conf
RUN mkdir /app
COPY --from=build-stage /app/dist /app
EXPOSE 8080:8080
CMD ["nginx", "-g", "daemon off;"]
