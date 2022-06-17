## Feature

The core feature of editor page should have two key features: editor, comment. In the web page,
should have entrance to home page and login page (conditional).

## Analyze

Navigation Bar:

Elements under navigation bar has two stage:
- normal -> mini icon.
- large -> panel and large icon.

Left Entry:

|                       |     CSS      |   Naming    | Interop | Mobeile | Desktop |
|-----------------------|:------------:|:-----------:|:-------:|:-------:|:-------:|
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
