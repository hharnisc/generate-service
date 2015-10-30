# <%= displayName %>

Note: these are the commands used to develop, dockerize, publish the service

<%= description %>

## Run

Run the container and dependencies in a produciton-like environment with docker compose

```bash
$ docker-compose up
```

or as a daemon

```bash
$ docker-compose up -d
```

#### Continuous Build

Run the container with live reload (with [nodemon](http://nodemon.io/)) in a production-like environment with docker compose

NOTE: this is expecting `vagrant` to be installed - https://docs.vagrantup.com/v2/installation/

```bash
$ sh start-dev.sh
```



#### Integration Tests

```bash
$ docker-compose -f docker-compose-integration-test.yml up
```

or as a daemon

```bash
$ docker-compose -f docker-compose-integration-test.yml up -d
```

## Build

```bash
$ docker build -t respondly/<%= name %>
```

## Publish

```bash
$ docker push respondly/<%= name %>
```
