#§ 'FROM node:' + data.config.npm.node.version + '-alpine'
FROM node:9.11-alpine

ADD . /src/
WORKDIR /src/

RUN npm install 2>&1 | tr -d '{}[]'
RUN NODE_ENV=production npm run build 2>&1 | tr -d '{}[]'


# Stage 2
FROM nginx:stable-alpine
WORKDIR /usr/share/nginx/html
COPY --from=0 /src/index.html ./
COPY --from=0 /src/favicon.ico ./
COPY --from=0 /src/assets/ ./assets/
COPY --from=0 /src/dist/ ./dist/
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
RUN ls
EXPOSE 8080



##§ '\n' + data.config.docker.generateDockerfileFrontMatter(data) + '\n' §##
LABEL maintainer="The Wise Team (https://wise-team.io/) <jedrzejblew@gmail.com>"
LABEL vote.wise.wise-version="1.2.2"
LABEL vote.wise.license="MIT"
LABEL vote.wise.repository="wise-hub"
##§ §.##
