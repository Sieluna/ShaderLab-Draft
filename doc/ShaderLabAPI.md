# Backend designing document and procedure

--------------------------------------

version: 0.0.1

## Base set up

--------------------------------------

**token design**

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

- admin
- user
- visitor

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

## user

--------------------------------------

