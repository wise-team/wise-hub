#§ 'FROM node:' + data.config.npm.node.version + '-slim'
FROM node:10.12-slim

WORKDIR /app/

RUN apt-get update && apt-get install -y \
    iputils-ping \
    iproute2 \
    curl \
 && rm -rf /var/lib/apt/lists/*


ADD package.json /app/
RUN npm install
ADD . /app/
RUN npm run build


COPY entrypoint.sh / 
ENTRYPOINT ["/entrypoint.sh"]

##§ '\n' + data.config.docker.generateDockerfileFrontMatter(data) + '\n' §##
LABEL maintainer="The Wise Team (https://wise-team.io/) <jedrzejblew@gmail.com>"
LABEL vote.wise.wise-version="3.0.5"
LABEL vote.wise.license="MIT"
LABEL vote.wise.repository="wise-hub"
##§ §.##