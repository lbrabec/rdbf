# ResultsDB frontend

Redesign of ResultsDB frontend written in React.


## Setup

First, clone the repository, then:

    $ npm install
    $ npm run start

The ResultsDB frontend is now running at <http://localhost:8080>

## Docker

To build docker image:

    $ docker build -t rdbf .

To run docker container:

    $ docker run -d -p 8080:80 rdbf

The ResultsDB frontend is now running at <http://localhost:8080>