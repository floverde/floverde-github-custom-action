FROM alpine:latest

#RUN apk add --update python3 py3-pip
RUN apk add --update py-pip

RUN pip install --upgrade pip
RUN pip install httpie-edgegrid
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
