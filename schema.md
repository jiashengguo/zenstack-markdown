# ZModel

> Generated by [`ZenStack-markdown`]((https://github.com/jiashengguo/zenstack-markdown))

- [Space](#Space)
- [SpaceUser](#SpaceUser)
- [User](#User)
- [List](#List)
- [Todo](#Todo)

## Space
```mermaid
erDiagram
"Space" {
  String id PK 
  DateTime createdAt  
  DateTime updatedAt  
  String name  
  String slug  
}
"Space" ||--o{ "SpaceUser": members
"Space" ||--o{ "List": lists
```
- CREATE
  - ❌auth() == null
  - ✅true
- READ
  - ❌auth() == null
  - ✅members ? [user == auth()]
- UPDATE
  - ❌auth() == null
  - ✅members ? [user == auth() && role == ADMIN]
- DELETE
  - ❌auth() == null
  - ✅members ? [user == auth() && role == ADMIN]
## SpaceUser
```mermaid
erDiagram
"SpaceUser" {
  String id PK 
  DateTime createdAt  
  DateTime updatedAt  
  String spaceId FK 
  String userId FK 
  SpaceUserRole role  
}
"SpaceUser" }o--|| "Space": space
"SpaceUser" }o--|| "User": user
```
- CREATE
  - ❌auth() == null
  - ✅space.members ? [user == auth() && role == ADMIN]
- READ
  - ❌auth() == null
  - ✅space.members ? [user == auth()]
- UPDATE
  - ❌auth() == null
  - ✅space.members ? [user == auth() && role == ADMIN]
- DELETE
  - ❌auth() == null
  - ✅space.members ? [user == auth() && role == ADMIN]
## User
```mermaid
erDiagram
"User" {
  String id PK 
  DateTime createdAt  
  DateTime updatedAt  
  String email  
  DateTime emailVerified  "?"
  String password  "?"
  String name  "?"
  String image  "?"
}
"User" ||--o{ "SpaceUser": spaces
"User" ||--o{ "List": lists
"User" ||--o{ "Todo": todos
```
- CREATE
  - ✅true
  - ✅auth() == this
- READ
  - ✅spaces ? [space.members ? [user == auth()]]
  - ✅auth() == this
- UPDATE
  - ✅auth() == this
- DELETE
  - ✅auth() == this
## List
```mermaid
erDiagram
"List" {
  String id PK 
  DateTime createdAt  
  DateTime updatedAt  
  String spaceId FK 
  String ownerId FK 
  String title  
  Boolean private  
}
"List" }o--|| "Space": space
"List" }o--|| "User": owner
"List" ||--o{ "Todo": todos
```
- CREATE
  - ❌auth() == null
  - ✅owner == auth() && space.members ? [user == auth()]
- READ
  - ❌auth() == null
  - ✅owner == auth() || (space.members ? [user == auth()] && !private)
- UPDATE
  - ❌auth() == null
  - ✅owner == auth() && space.members ? [user == auth()] && future().owner == owner
- DELETE
  - ❌auth() == null
  - ✅owner == auth()
## Todo
```mermaid
erDiagram
"Todo" {
  String id PK 
  DateTime createdAt  
  DateTime updatedAt  
  String ownerId FK 
  String listId FK 
  String title  
  DateTime completedAt  "?"
}
"Todo" }o--|| "User": owner
"Todo" }o--|| "List": list
```
- CREATE
  - ❌auth() == null
  - ✅list.owner == auth()
  - ✅list.space.members ? [user == auth()] && !list.private
- READ
  - ❌auth() == null
  - ✅list.owner == auth()
  - ✅list.space.members ? [user == auth()] && !list.private
- UPDATE
  - ❌future().owner != owner
  - ❌auth() == null
  - ✅list.owner == auth()
  - ✅list.space.members ? [user == auth()] && !list.private
- DELETE
  - ❌auth() == null
  - ✅list.owner == auth()
  - ✅list.space.members ? [user == auth()] && !list.private