# Mini Social Media Platform - Backend API

A RESTful backend service for a social media platform built with Node.js, Express, and Sequelize ORM. It provides user authentication, post creation, comments, ephemeral stories, and direct messaging capabilities.

---

## Features

- **Authentication & Authorization**: Secure signup, login, and protected routes using JSON Web Tokens (JWT) and `bcryptjs` password hashing.
- **User Management**: User profiles, account settings, and association management.
- **Posts & Feed**: Create, retrieve, update, and delete posts with text and media references.
- **Comments System**: Threaded commenting on posts.
- **Stories**: Ephemeral media/text stories designed to expire after 24 hours.
- **Direct Messaging**: 1-on-1 private messaging between users.

---

## Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database / ORM**: [Sequelize](https://sequelize.org/) (MySQL / PostgreSQL / SQLite compatible)
- **Security**: `jsonwebtoken` (JWT), `bcryptjs`, `cors`
- **Utilities**: `dotenv`, `moment` / `moment-timezone`, `uuid`

---

## Project Structure

```text
mini-social-media/
├── backend/
│   ├── .env                  # Environment configuration
│   ├── db.js                 # Database connection instance
│   ├── server.js             # Application entry point
│   ├── middleware/
│   │   └── auth.js           # JWT authentication middleware
│   ├── models/
│   │   ├── index.js          # Model relationships & exports
│   │   ├── User.js           # User schema
│   │   ├── Post.js           # Post schema
│   │   ├── Comment.js        # Comment schema
│   │   ├── Story.js          # Story schema
│   │   └── Message.js        # Direct message schema
│   └── package.json
└── README.md
