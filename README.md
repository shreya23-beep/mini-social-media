ces.Comments System: Nested/threaded commenting on posts.Stories: Ephemeral media/text stories designed to expire after 24 hours.Direct Messaging: 1-on-1 private messaging between connected users.Tech StackRuntime: Node.jsFramework: Express.jsDatabase / ORM: Sequelize (MySQL / PostgreSQL / SQLite compatible)Security: jsonwebtoken (JWT), bcryptjs, corsUtilities: dotenv, moment / moment-timezone, uuidProject StructurePlaintextmini-social-media/
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
Getting StartedPrerequisitesNode.js (v16.x or higher recommended)npm or yarnRelational database instance (MySQL, PostgreSQL, or SQLite)InstallationClone the repository:Bashgit clone https://github.com/your-username/mini-social-media.git
cd mini-social-media/backend
Install dependencies:Bashnpm install
Configure Environment Variables:Create a .env file in the backend/ directory:Code snippetPORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=mini_social_media
DB_DIALECT=mysql

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
Run Database Migrations / Sync:Ensure your database service is running. On server boot, Sequelize will automatically synchronize models according to your db.js configuration.Start the development server:Bash# Development with automatic restart
npm run dev

# Production mode
npm start
The server will start listening at http://localhost:5000.API Endpoints OverviewAuthentication (/api/auth)MethodEndpointDescriptionProtectedPOST/api/auth/registerRegister a new userNoPOST/api/auth/loginLog in and receive a JWT tokenNoGET/api/auth/meFetch authenticated user profileYesPosts (/api/posts)MethodEndpointDescriptionProtectedGET/api/postsRetrieve feed postsYesPOST/api/postsCreate a new postYesGET/api/posts/:idGet single post detailsYesDELETE/api/posts/:idDelete post by IDYesComments (/api/comments)MethodEndpointDescriptionProtectedGET/api/posts/:postId/commentsList comments for a postYesPOST/api/posts/:postId/commentsAdd comment to a postYesDELETE/api/comments/:idDelete a commentYesStories (/api/stories)MethodEndpointDescriptionProtectedGET/api/storiesFetch active user and friend storiesYesPOST/api/storiesUpload a new storyYesDELETE/api/stories/:idRemove an active storyYesMessages (/api/messages)MethodEndpointDescriptionProtectedGET/api/messages/:userIdGet chat history with a specific userYesPOST/api/messagesSend a direct messageYesAuthentication HeaderFor protected routes, include the JWT token in the Authorization header:HTTPAuthorization: Bearer <your_jwt_token>
LicenseThis project is licensed under the MIT License.
