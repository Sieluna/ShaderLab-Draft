# Backend designing document and procedure

--------------------------------------

version: 0.0.1

## Base set up

--------------------------------------

**token design**
 
To avoid anonymity visit on a heavy api, such as two table select by union or join and update something. would be quite dangerous.
An identity of valid request is important. How to make sure a request is a safe request? token might be a good option. 

| Data     | Datatype |     Usage     |
|----------|:--------:|:-------------:|
| id       |  number  |    User Id    |
| auth     |  string  |  permission   |
| default  |  string  | iat, balabala |
| addition |  string  |    random     |

```mermaid
sequenceDiagram
    participant client
    participant server
    client-->>server: Request /api/* (delined)
    client->>server: /api/user/login {account, password}
    server->>server: generate token by jwt
    server->>client: response with token
    client->>server: add token under Authorization header
    server->>server: vertify
    server-->>client: appropriate response if token is valid
    client->>server: send refresh token request
    server->>server: vertify
    server->>client: resfresh {state, new token}
```

**user permission**

|          | Admin | User | Visitor |
|:---------|:-----:|:----:|:-------:|
| /admin/* |   X   |      |         |
| /api/*   |   X   |  X   |    X    |
| /*       |   X   |  X   |    X    |    
- admin -> /api*, /admin*
- user -> /api*
- visitor -> /* exclude /admin* and /api/*

**Structure design**

```mermaid
sequenceDiagram
    participant model
    participant handle
    participant middle
    participant routes
    routes-->>middle: no token (delined)
    routes->>middle: vertify or login
    routes->>handle: request to valid data 
    handle->>model: query from model
    model->>handle: error or json
    handle-->>middle: update token?
    middle->routes: error handle and resoponse
```

## User

--------------------------------------

REST -> Find, create, update, delete

Need register

User password could have no length limit.
md 5 could compress to 32.

## Home

--------------------------------------

**design**

/shader ->

## Editor

--------------------------------------

**design**

/shader/:id -> to enter into the post


