FROM mongo:4

COPY mongod.conf /etc/mongod.conf

COPY setup/ /docker-entrypoint-initdb.d/

EXPOSE 8080

# Specifies the configuration file.
CMD ["-f", "/etc/mongod.conf"]
