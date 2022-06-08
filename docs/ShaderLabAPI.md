# Backend designing document and procedure

--------------------------------------

version: 0.0.1

## Base set up

--------------------------------------

**token design**
 
To avoid anonymity visit on a heavy api, such as two table select by union or join and update something. would be quite dangerous.


| Data     | Datatype |     Usage     |
|----------|:--------:|:-------------:|
| id       |  number  |    User Id    |
| auth     |  string  |  permission   |

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

3 level design would be good enough to.

```mermaid
graph TD;
    Visitor --> User --> Admin
```

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

```mermaid
graph TD;
    ModelHandle ----> Mysql
    SearchHandle --> UserHandle
    SearchHandle --> PostHandle
    SearchHandle --> TagHandle
    SearchHandle --> TopicHandle
    UserHandle ---> User
    PostHandle --> TagHandle
    PostHandle --> TopicHandle
    PostHandle ---> Post
    TagHandle --> Tag
    TopicHandle --> Topic
```

```mermaid
graph TD;
    UserAPI --> UserHandle
    PostAPI --> PostHandle
    TagAPI --> TagHandle
    TopicAPI --> TopicHandle
    SearchAPI --> SearchHandle
```
