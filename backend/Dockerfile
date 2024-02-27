FROM node:20-alpine3.18 as builder
ADD https://github.com/opentofu/opentofu/releases/download/v1.6.1/tofu_1.6.1_linux_amd64.zip /tmp/
COPY tofu_SHA256SUMS /tmp/
RUN cd /tmp && sha256sum -c tofu_SHA256SUMS
RUN cd /tmp && unzip tofu_1.6.1_linux_amd64.zip
RUN mkdir /app
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY ./ .
RUN npm run build

FROM node:20-alpine3.18 as package
ARG CI_ENV=noci
ARG GIT_COMMIT=git_commit_undefined
ARG GIT_BRANCH=git_branch_undefined
ARG VERSION=not_versioned
COPY --from=builder /tmp/tofu /usr/local/bin/
RUN apk add openssh git && mkdir /app && echo "version=$VERSION" > /app/version && echo "commit=$GIT_COMMIT" >> /app/version && echo "branch=$GIT_BRANCH" >> /app/version
WORKDIR /app
RUN addgroup -S apprunner && adduser -S apprunner -G apprunner && chown apprunner:apprunner -R /app
COPY --chown=apprunner:apprunner package*.json ./
COPY --from=builder --chown=apprunner:apprunner /app/dist ./
COPY --chown=apprunner:apprunner src/schema.graphql /app/src/
USER apprunner
RUN mkdir tf_space && npm install --omit=dev && git config --global init.defaultBranch main

LABEL git_commit $GIT_COMMIT
LABEL git_branch $GIT_BRANCH
LABEL ci_environment $CI_ENV
LABEL version $VERSION

EXPOSE 4001

CMD ["node", "/app/src/main.js"]