#§ 'FROM node:' + data.config.npm.node.version + '-alpine'
FROM node:10.12-alpine

WORKDIR /app/

ADD package.json package-lock.json /app/
RUN npm install


ADD . /app/
RUN npm run build

##§ '\n' + data.config.docker.generateDockerfileFrontMatter(data) + '\n' §##
LABEL maintainer="The Wise Team (https://wise-team.io/) <jedrzejblew@gmail.com>"
LABEL vote.wise.wise-version="3.0.2"
LABEL vote.wise.license="MIT"
LABEL vote.wise.repository="wise-hub"
##§ §.##