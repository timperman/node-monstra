FROM node

ENV PORT 3000
EXPOSE 3000

ADD bin bin
ADD package.json package.json
RUN npm install

ADD . /

ENTRYPOINT [ "npm" ]
CMD [ "start" ]
