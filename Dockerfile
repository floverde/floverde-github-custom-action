FROM alpine:latest
RUN apk add --update python3 py3-pip build-base musl python3-dev libffi libffi-dev openssl-dev
RUN pip3 install httpie-edgegrid
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
