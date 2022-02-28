FROM alpine:latest
RUN apk add --update python3 py3-pip
RUN pip3 install --upgrade pip3
RUN pip3 install httpie-edgegrid
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
