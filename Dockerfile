FROM timbru31/ruby-node:2.7 as builder

RUN mkdir /usr/src/app
WORKDIR /usr/src/app
ENV PATH /usr/src/app/node_modules/.bin:$PATH
#ENV CHROME_BIN /usr/bin/chromium-browser
COPY package.json /usr/src/app/package.json

RUN npm install -g bower
RUN npm install -g grunt-cli
COPY . /usr/src/app
RUN bower --allow-root install
RUN npm install
RUN bundle install
#RUN grunt test --code-coverage --force
RUN grunt prod

FROM nginx:1.19.3
COPY --from=builder /usr/src/app/dist/community-app /usr/share/nginx/html
COPY ./nginx-conf/* /etc/nginx/conf.d/
COPY default.conf.template /etc/nginx/conf.d/default.conf
EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]
