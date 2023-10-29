[Go Back](README.md)

## Installation

Please check the official nuxt installation guide. [Official Documentation](https://nuxt.com/docs)

Check and make sure you copied the `.env.example` to `.env` or it is already exists.

## Configure Docker

Change directory to the docker folder:

```bash
cd docker
```

Check if it has `.env` environment variables file already in place otherwise copy `.env.example` to create one `.env`

```bash
cp .env.example .env
```

Whatever is the Nuxt port you used needs to be used on application directory `/.env` file accordingly.

If it is first time building docker container, run below command to Build images before starting containers.

```bash
docker-compose up --build
```

## Get Inside The Container

Access the container shell to execute commands by running the following command: 

```bash
docker exec -it laranuxt_nuxt_frontend /bin/sh
```

## Some useful docker commands

- `docker ps` - List all running containers.
- `docker ps --filter "name=laranuxt"` - List running containers filtered by name.
- `docker stop container-name` - Stop a running container gracefully.
- `docker kill container-name` - Forcefully stop a running container.
- `docker restart container-name` - Restart a container.
- `docker rm container-name` - Remove a stopped container.

## Stop all running container of the project

```bash
docker-compose down
```

## Visit different container on browser

- [Application](http://localhost:3090)

### Documentation & Collaborations

- [GitHub](https://github.com/phpfarmer/laranuxt-frontend-docker-starter)