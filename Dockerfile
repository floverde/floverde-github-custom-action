FROM alpine:latest
RUN pip install --upgrade pip && pip install httpie-edgegrid
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
