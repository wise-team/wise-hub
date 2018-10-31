#§ 'FROM node:' + data.config.npm.node.version + '-alpine'
FROM node:10.12-alpine


ADD . /app/
WORKDIR /app/

RUN npm install
RUN npm run build

CMD node dist/index.js

##§ '\n' + data.config.docker.generateDockerfileFrontMatter(data) + '\n' §##
LABEL maintainer="The Wise Team (https://wise-team.io/) <jedrzejblew@gmail.com>"
LABEL vote.wise.wise-version="2.3.1"
LABEL vote.wise.license="MIT"
LABEL vote.wise.repository="wise-hub"
##§ §.##