#!/bin/bash


sed -i "s/{host}/${host}/g" /usr/src/app/public/api-docs/index.html
sed -i "s/{nodePort}/${node_port}/g" /usr/src/app/public/api-docs/index.html
sed -i "s/{host}/${host}/g" /usr/src/app/server.js
sed -i "s/{nodePort}/${no0de_port}/g" /usr/src/app/server.js


node /usr/src/app/server.js

