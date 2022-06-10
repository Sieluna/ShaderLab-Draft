### Feature

The core feature of home page should have three key features: search, user, preview features. In the web page,
should have entrance to editor page and login page (conditional). 

Structure design: Navigation, Layout

Navigation: search, filter and user control.

|             |    CSS     |  Naming   | Interop | Mobeile | Desktop |
|-------------|:----------:|:---------:|:-------:|:-------:|:-------:|
| Navigation  |  nav.css   |  sl-nav   |  True   | Enable  | Enable  |
| Main Layout | layout.css | sl-layout |  True   | Enable  | Enable  |

### Analyze

This page should contain 50% functions of the application, including search, user, info.

Navigation Bar:

Elements under navigation bar has two stage:
- normal -> mini icon.
- large -> panel and large icon.

Left Entry:

|                       |     CSS      |   Naming    | Interop | Mobeile | Desktop |
|-----------------------|:------------:|:-----------:|:-------:|:-------:|:-------:|
| Home Entry            | nav left.css | sl-nav__bar |  True   | Disable | Enable  |
| Login Entry -> shared | nav left.css | sl-nav__bar |  True   | Enable  | Disable |

Right Entry:

|                       |      CSS      |  Naming     | Interop | Mobeile | Desktop |
|-----------------------|:-------------:|:-----------:|:-------:|:-------:|:-------:|
| Login Entry -> shared | nav right.css | sl-nav__bar |  True   | Enable  | Disable |
| Message Entry         | nav right.css | sl-nav__bar |  True   | Disable | Enable  |
| History Entry         | nav right.css | sl-nav__bar |  True   | Disable | Enable  |
| Upload Entry          | nav right.css | sl-nav__bar |  True   | Disable | Enable  |

Main Layout:

|           |        CSS        |        Naming        | Interop | Mobeile | Desktop |
|-----------|:-----------------:|:--------------------:|:-------:|:-------:|:-------:|
| Recommend |  nav suggest.css  | sl-layout__recommend |  True   | Enable  | Enable  |
| Holder    | nav container.css |  sl-layout__holder   |  True   | Enable  | Enable  |

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
