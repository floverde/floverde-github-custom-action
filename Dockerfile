FROM alpine:latest

RUN apk add --update python3 py3-pip build-base musl python3-dev libffi libffi-dev rust cargo openssl-dev
RUN pip3 install --upgrade pip https://github.com/sbidoul/pip/archive/wheel-absent-warning-sbi.zip cryptography httpie-edgegrid

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]