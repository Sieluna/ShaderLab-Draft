# Page designing document and procedure

--------------------------------------

version: 2.0.1

**language Specification**

| Module  | Specification |
|:-------:|:-------------:|
| nodeJS  |   commonJS    |
| browser | ES 6 Standard |  

https://mermaid-js.github.io/mermaid/


## Login page

--------------------------------------

### Feature

Register and login feature.

Structure design: Background, Navigation Bar, Main Panel

|                |    CSS    |   Naming   | Interop | Mobeile | Desktop |
|----------------|:---------:|:----------:|:-------:|:-------:|:-------:|
| Background     |  inline   | sl-bground |  None   | Disable | Enable  |
| Navigation bar |  nav.css  | sl-navbar  |  None   | Disable | Enable  |
| Main Panel     | panel.css |  sl-panel  |  True   | Enable  | Enable  |

### Analyze

If user already registered, this page should not be load.

| Feature      |                    Request                    |  Response   |
|:-------------|:---------------------------------------------:|:-----------:|
| Page Loading |              GET api/img/random               | RETURN blob |
| Register     | POST {Account: string16, password: string32 } | RETURN JSON |
| Login        | POST {Account: string16, password: string32 } | RETURN JSON |

## Home Page

--------------------------------------

### Feature

In home page we should have three key features:

- search
- user
- preview

Structure design: Navigation, Layout

Navigation: search, filter and user control.

|             |         CSS          |  Naming   | Interop | Mobeile | Desktop |
|-------------|:--------------------:|:---------:|:-------:|:-------:|:-------:|
| Navigation  | nav.css, feature.css |  sl-nav   |  True   | Enable  | Enable  |
| Main Layout |      layout.css      | sl-layout |  True   | Enable  | Enable  |

### Analyze

This page should contain 50% functions of the application, including search, user, info.

Navigation Bar:

Elements under navigation bar has two stage:
- normal -> mini icon.
- large -> panel and large icon.

Left Entry:

|                       |     CSS     |  Naming   | Interop | Mobeile | Desktop |
|-----------------------|:-----------:|:---------:|:-------:|:-------:|:-------:|
| Home Entry            | feature.css | sl-navbar |  True   | Disable | Enable  |
| Login Entry -> shared | feature.css | sl-navbar |  True   | Enable  | Disable |

Right Entry:

|                       |     CSS     |  Naming   | Interop | Mobeile | Desktop |
|-----------------------|:-----------:|:---------:|:-------:|:-------:|:-------:|
| Login Entry -> shared | feature.css | sl-navbar |  True   | Enable  | Disable |
| Message Entry         | feature.css | sl-navbar |  True   | Disable | Enable  |
| History Entry         | feature.css | sl-navbar |  True   | Disable | Enable  |
| Upload Entry          | feature.css | sl-navbar |  True   | Disable | Enable  |

Main Layout:

|           |    CSS     |    Naming    | Interop | Mobeile | Desktop |
|-----------|:----------:|:------------:|:-------:|:-------:|:-------:|
| Recommend | layout.css | sl-recommend |  True   | Enable  | Enable  |
| Holder    | layout.css |  sl-holder   |  True   | Enable  | Enable  |

Layout should get the data from database under **ranking**.

| Feature      |         Request          |   Response   |
|:-------------|:------------------------:|:------------:|
| Page Loading |      GET /api/post       | RETURN JSON  |
|              |   GET /api/user/vertify  | RETURN token |
| Search       |    GET /api/post/tag     | RETURN JSON  |

```mermaid
sequenceDiagram
    participant local
    participant client
    participant server
    client-->>local: get user info
    client-->>local: get token
    local->>client: user?
    client->>local: render user entry or login entry
    local->>client: token
    client->>server: send user
    server->>client: return new token
    client->>server: Request /api/post
    server->>client: Response img.src and name
```

Search panel implement:

```mermaid
flowchart TD
    Static --> focus{On focus}
    focus --> |No longer focus| End
    focus --> |Stay| extend[Open large]
    focus --> |Input > 0| search[Searching]
    extend ---> |On extend outer| End
    extend --> |On extend| extend
    search --> |> 0| extendListLayout[List searching result]
    search --> |< 0| extend
    extendListLayout --> End
```

User avatar icon implement:

```mermaid
flowchart TD
    small[User small icon] --> mouseover{On top}
    mouseover --> |Stay > 0.3s| large[User large icon]
    mouseover --> |Stay < 0.3s| lockevent[set time out]
    mouseover --> |Locked| End
    lockevent --> large
    large --> leave[Leave]
    leave --> End
```

## Editor Page

--------------------------------------


