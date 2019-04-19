FROM node:10.15.0
RUN apt-get update \
    && apt-get -y install curl 

RUN mkdir -p /usr/src/app
RUN mkdir -p /usr/src/nokia/image/challenge
WORKDIR /usr/src/app
#COPY package*.json ./
COPY dao/ /usr/src/app/dao
COPY package.json /usr/src/app/package.json
COPY routes/ /usr/src/app/routes
COPY public/ /usr/src/app/public
COPY server.js /usr/src/app/server.js
COPY start.sh /start.sh
RUN chmod +x /start.sh
WORKDIR /usr/src/app
RUN npm install
EXPOSE 3000
CMD ["/start.sh"]
#CMD node server.js
#CMD tail -f /dev/null
