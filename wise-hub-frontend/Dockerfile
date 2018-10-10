#§ 'FROM node:' + data.config.npm.node.version + '-alpine'
FROM node:9.11-alpine

ADD . /src/
WORKDIR /src/

RUN sh -c "npm install 2>&1"
RUN sh -c "NODE_ENV=production npm run build 2>&1"

CMD ["npm", "run", "serve" ]


##§ '\n' + data.config.docker.generateDockerfileFrontMatter(data) + '\n' §##
LABEL maintainer="The Wise Team (https://wise-team.io/) <jedrzejblew@gmail.com>"
LABEL vote.wise.wise-version="1.2.2"
LABEL vote.wise.license="MIT"
LABEL vote.wise.repository="wise-hub"
##§ §.##