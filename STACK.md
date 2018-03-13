# Stack integration
This documentation shows how to configure the docker-compose file to use external services for some of the modules presented in this project.
## SQL
This module requires the AGILE-SQL Connector ([agile-sql](https://github.com/agile-iot/agile-sql)) and AGILE-SQL-PARSER ([agile-sqlparser](https://github.com/agile-iot/agile-sqlparser)) and a database. The database can be either a plain MySQL database or CryptDB, which stores the data encrypted in a MySQL database.
### MySQL Database
To be able to interact with a MySQL database, add the following micro-services to your docker-compose file:

```
  sql-db:
    #In a rpi use this one 
    #image: hypriot/rpi-mysql
    #For intel use this one
    image: mysql
    container_name: sql-db
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: root
    ports:
      - 3306:3306/tcp

  sql-parser:
    image: agileiot/agile-sqlparser-$AGILE_ARCH:v0.0.2
    container_name: sql-parser
    restart: always
    depends_on:
      - sql-db
    ports:
      - 9123:9123/tcp

  agile-sql:
    image: agileiot/agile-sql-$AGILE_ARCH:v0.1.1
    container_name: agile-sql
    restart: always
    depends_on:
      - sql-parser
      - sql-db
    ports:
      - 3005:3005/tcp
    volumes:
      - $DATA/agile-sql/:/etc/agile-sql/    
```
More information can be found at [agile-sql](https://github.com/agile-iot/agile-sql)
## CryptDB
To be able to interact with a CryptDB database, add the following micro-services to your docker-compose file:

```
  agile-cryptdb:
    container_name: agile-cryptdb
    hostname: agile-cryptdb
    image: agileiot/Practical-Cryptdb_Docker-$AGILE_ARCH:v0.0.1
    restart: always
    depends_on:
      - agile-cryptdb-backend
    ports:
      - 3399:3399/tcp

  agile-cryptdb-backend:
    container_name: agile-cryptdb-backend
    hostname: agile-cryptdb-backend
    image: agileiot/agile-cryptdb-backend-$AGILE_ARCH:v0.0.1
    restart: always
    ports:
      - 3306:3306/tcp
    environment:
      MYSQL_ROOT_PASSWORD: root
    volumes:
      - $DATA/agile-cryptdb-backend:/var/lib/mysql

  sql-parser:
    image: agileiot/agile-sqlparser-$AGILE_ARCH:v0.0.2
    container_name: sql-parser
    restart: always
    depends_on:
      - agile-cryptdb
    ports:
      - 9123:9123/tcp

  agile-sql:
    image: agileiot/agile-sql-$AGILE_ARCH:v0.1.1
    container_name: agile-sql
    restart: always
    depends_on:
      - sql-parser
      - agile-cryptdb
    ports:
      - 3005:3005/tcp
    volumes:
      - $DATA/agile-sql/:/etc/agile-sql/    
```
**Note:** To be able to use another backend database, it is necessary to change the default host and/or port of the database backend in agile-sql. 
According to the docker-compose snippet shown before your configuration would be in $DATA/agile-sql/agile-db.js . Which is commonly ~/.agile/agile-sql/agile-db.js.

To adjust the default configuration for the CryptDB example above, you can use the following example for the database host:
    
    db:{
      host: 'agile-cryptdb',
      user: 'root',
      port: 3399,
      password: 'root',
      database: 'agile'
    }
    
More information and troubleshooting can be found at [agile-sql](https://github.com/agile-iot/agile-sql) and [Practical-CryptDB-Docker](https://github.com/agile-iot/Practical-CryptDB_Docker)
