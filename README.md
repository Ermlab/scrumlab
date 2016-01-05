## Scrumlab - Gitlab and Scrum integration platform
![alt tag](http://ermlab.com/wp-content/uploads/bfi_thumb/scrumlab-x-mhnnt725cz7yewtoou0387xulfo37gor7h9pp01abs.png)

## Description
Scrumlab is a platform which integrates popular software and project management system – Gitlab and Scrum methodology. We create reactive kanban dashboard and provide sprints functionality.

## Features

* Fetching Gitlab projects
* Syncing Issues 
* Creating/editing Sprints
* Estimating Sprints/Issues time
* Plan Sprint
* Changing issue status

## Try Scrumlab

http://scrumlab.it


## Prerequisites:
* Gitlab - server - link to intalation prcedure
* Mongo container with replica sets (one machine)

# Installation


1. Pull latest mongodb image and run container
  
    ```    
    docker pull mongo:latest
    docker run --name db -d mongo --replSet rs0
    ```
2. Install mongo client 

    ```    
    sudo apt-get install mongodb-clients
    ```
3.  Check container ip address, connect to database Container and implement replica set

    ```    
    docker inspect db | grep "IPAddress"
    mongo 172.17.0.1:27017
  
    rs.initiate()

    exit

    ```
4.  Pull scrumlab image, run Container and link database 

    ```
    docker pull ermlab/scrumlab

    docker run -d --name scrumlab -e ROOT_URL=http://127.0.0.1 -e MONGO_URL=mongodb://db:27017/test -e MONGO_OPLOG_URL=mongodb://db:27017/local -p 80:80 --link db:db ermlab/scrumlab
    ```


# License

For non-comercial and opensource projects - MIT license

For comercial us - please contacta us office@ermlab.com 

