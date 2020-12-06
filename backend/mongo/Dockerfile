FROM mongo:4

COPY mongod.conf /etc/mongod.conf

COPY setup/ /docker-entrypoint-initdb.d/

RUN chmod 777 -R /data/db

# Specifies the configuration file.
CMD ["-f", "/etc/mongod.conf"]
