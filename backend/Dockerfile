#§ 'FROM node:' + data.config.npm.node.version + '-slim'
FROM node:10.15-slim

WORKDIR /app/

RUN apt-get update && apt-get install -y \
    iputils-ping \
    iproute2 \
    curl \
    && rm -rf /var/lib/apt/lists/*


ADD package.json package-lock.json /app/
RUN npm install
ADD . /app/
RUN npm run build


COPY entrypoint.sh / 
ENTRYPOINT ["/entrypoint.sh"]

HEALTHCHECK --interval=30s --timeout=15s --start-period=30s --retries=2 CMD [ "node", "container-healthcheck.js" ]

##§ '\n' + data.config.docker.generateDockerfileFrontMatter(data) + '\n' §##
LABEL maintainer="The Wise Team (https://wise-team.io/) <contact@wiseteam.io>"
LABEL vote.wise.wise-version="3.1.0"
LABEL vote.wise.license="MIT"
LABEL vote.wise.repository="wise-hub"
##§ §.##