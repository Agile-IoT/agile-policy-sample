#For ARM use this one.
#FROM resin/raspberry-pi3-node:7.8.0-20170426
#For intel use this one 
FROM resin/intel-nuc-node:7.8.0-20170506
COPY . /opt/app
WORKDIR /opt/app/
#gets rid of the node_modules installed by travis.
RUN rm -rf node_modules
RUN npm install
RUN ls /opt/app/lib
EXPOSE 4000
ENTRYPOINT [ "node", "/opt/app/lib/index.js" ]
