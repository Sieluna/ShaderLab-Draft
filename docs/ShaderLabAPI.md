# Backend design

## Basic set up

### token design
 
To avoid anonymity visit on a heavy api, such as two table select by union or join and update something. would be quite dangerous.


| Data     | Datatype |     Usage     |
|----------|:--------:|:-------------:|
| id       |  number  |    User Id    |
| auth     |  string  |  permission   |

```mermaid
sequenceDiagram
    participant client
    participant server
    participant session
    client ->> server: Request /api/* (delined)
    client ->> server: /api/user/singin {account, password}
    server ->> server: generate token by jwt
    Note right of client: singup
    server -->> client: response with token
    client ->> server: add token under Authorization header
    server ->> server: vertify
    server ->> session: add refresh token
    session -->> server: response with refresh token or error
    server-->> client: appropriate response if token is valid
    server-->> client: resfresh {state, new token}
    server-->> client: logout
```

### user permission

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
graph LR;
    Visitor --> User --> Admin
```

### Structure design

```mermaid
sequenceDiagram
    participant model
    participant handle
    participant middle
    participant routes
    routes -->> middle: no token (delined)
    routes ->> middle: vertify or login
    middle ->> handle: request to valid data 
    handle ->> model: query from model
    model -->> handle: error or json
    handle -->> routes: update token?
    handle -->> routes: error handle and resoponse
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
    UserAPI --> UserValidator --> UserHandle
    PostAPI --> PostValidator --> PostHandle
    TagAPI --> TagValidator --> TagHandle
    TopicAPI --> TopicValidator --> TopicHandle
    SearchAPI --> SearchValidator --> SearchHandle
```

```mermaid
sequenceDiagram
    participant req
    participant validator
    participant handle
    participant res
    req ->> validator: params is valid
    validator -->> res: throw and catch error
    validator ->> handle: deal with the safe data
    handle -->> validator: check the data type safe
    handle ->> res: return back the same data
    validator -->> res: throw and catch erro
```
