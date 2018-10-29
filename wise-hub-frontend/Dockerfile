#§ 'FROM node:' + data.config.npm.node.version + '-alpine'
FROM node:10.12-alpine

ARG wise_sql_endpoint_url

ADD . /src/
WORKDIR /src/

RUN npm install 2>&1 | tr -d '{}[]'
RUN NODE_ENV=production \
    WISE_SQL_ENDPOINT_URL="$wise_sql_endpoint_url" \
    npm run build 2>&1 | tr -d '{}[]'


# Stage 2
FROM nginx:1
WORKDIR /usr/share/nginx/html
COPY --from=0 /src/index.html ./
COPY --from=0 /src/favicon.ico ./
COPY --from=0 /src/assets/ ./assets/
COPY --from=0 /src/dist/ ./dist/
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf



##§ '\n' + data.config.docker.generateDockerfileFrontMatter(data) + '\n' §##
LABEL maintainer="The Wise Team (https://wise-team.io/) <jedrzejblew@gmail.com>"
LABEL vote.wise.wise-version="2.3.1"
LABEL vote.wise.license="MIT"
LABEL vote.wise.repository="wise-hub"
##§ §.##
