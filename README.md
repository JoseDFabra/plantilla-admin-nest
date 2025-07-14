<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## creacion de tablas en la base de datos para iniciar un nuevo proyecto

```
-- Crear tabla de Roles
CREATE TABLE Roles (
  id INT PRIMARY KEY IDENTITY(1,1),
  nombre NVARCHAR(100) NOT NULL UNIQUE
);

-- Insertar roles base
INSERT INTO Roles (nombre) VALUES
  ('SuperAdmin'),
  ('Admin'),
  ('Moderador'),
  ('SuperUser'),
  ('User');

-- Crear tabla de Users
CREATE TABLE Users (
  id INT PRIMARY KEY IDENTITY(1,1),
  nombre_completo NVARCHAR(200) NOT NULL,
  documento NVARCHAR(20) NOT NULL UNIQUE,
  telefono NVARCHAR(20),
  correo NVARCHAR(150),
  password NVARCHAR(255) NOT NULL,
  refreshToken NVARCHAR(MAX) NULL,
  id_rol INT NOT NULL,
  is_active BIT NOT NULL DEFAULT 1,
  CONSTRAINT FK_Users_Roles FOREIGN KEY (id_rol) REFERENCES Roles(id)
);



INSERT INTO Users (
  nombre_completo,
  documento,
  telefono,
  correo,
  password,
  refreshToken,
  id_rol,
  is_active
) VALUES (
  'Jose Daniel Fabra',
  '1234',
  '3001234567',
  'admin@itm.edu.co',
  '$2b$10$K7m3Ps.cTS3ThgyqlBfs6.2RnSsm0yPAtqFVDVuq5NT441JvtqH8q',
  NULL,
  1,  -- id del rol "SuperAdmin"
  1 
);

```