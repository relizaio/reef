FROM node:20-alpine3.17 as builder
ADD https://releases.hashicorp.com/terraform/1.1.9/terraform_1.1.9_linux_amd64.zip /tmp/
COPY terraform_1.1.9_SHA256SUMS /tmp/
RUN cd /tmp && sha256sum -c terraform_1.1.9_SHA256SUMS
RUN cd /tmp && unzip terraform_1.1.9_linux_amd64.zip

FROM node:20-alpine3.17 as package
ARG CI_ENV=noci
ARG GIT_COMMIT=git_commit_undefined
ARG GIT_BRANCH=git_branch_undefined
ARG VERSION=not_versioned
RUN apk add openssh
COPY --from=builder /tmp/terraform /usr/local/bin/
RUN mkdir /app
RUN echo "version=$VERSION" > /app/version && echo "commit=$GIT_COMMIT" >> /app/version && echo "branch=$GIT_BRANCH" >> /app/version
WORKDIR /app
COPY package*.json ./
RUN npm install && npm install -g ts-node
COPY ./ .

LABEL git_commit $GIT_COMMIT
LABEL git_branch $GIT_BRANCH
LABEL ci_environment $CI_ENV
LABEL version $VERSION

RUN addgroup -S apprunner && adduser -S apprunner -G apprunner && chown apprunner:apprunner -R /app
USER apprunner

EXPOSE 3051

CMD ["npm", "start"]