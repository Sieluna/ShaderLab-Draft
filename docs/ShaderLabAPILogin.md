## User

--------------------------------------

### Analyze

In user api should have register, login, update, abort feature.

The user part have to focus on the user database.

**API design**

|        | API                   | Introduction         |
|:------:|-----------------------|----------------------|
|  Get   | /api/user             | Get the all the user |
|  Get   | /api/user/:id         | Get a user with id   |
|  Post  | /api/user/signup      | Register             |
|  Post  | /api/user/signin      | Login                |
|  Put   | /api/user/avatar      | Update user avatar   |
|  Put   | /api/user/email       | Update user email    |
|  Put   | /api/user/password    | Update user password |
| Delete | /api/user/abort/:id   | Abort user           |
|  Get   | /api/user/restore/:id | Restore user         | 

User password could have no length limit. - md 5 could compress to 32.
