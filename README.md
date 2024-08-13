# API

This is an Express API with JWT authentication and MongoDB for handling users and comments. The API allows user signup, login, and promotion to different membership statuses. Comments can be created, viewed, and deleted depending on the user's membership status.

## Features

- **User Signup:** Create a new user with a unique username and a hashed password.
- **User Login:** Authenticate a user using JWT and return a token for subsequent requests.
- **Membership Promotion:** Promote users to different membership statuses (regular, member, admin) with passcodes.
- **Comment Management:**
  - Regular users can view comments without seeing the authors.
  - Members can view comments along with the authors.
  - Admins can delete any comment.

## Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/fatihyd/comment-wall-app.git
   cd comment-wall-app
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

3. Create a `.env` file in the root directory with the following content:

   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   MEMBER_PASSCODE=your_member_passcode
   ADMIN_PASSCODE=your_admin_passcode
   ```

4. Start the application:
   ```sh
   npm start
   ```

## API Endpoints

### User Routes

- **POST /api/users/signup** - Create a new user

  - **Request Body:**
    - `username` (string, required): The unique username for the new user.
    - `password` (string, required): The password for the new user, which will be hashed before saving.
  - **Response:**
    - `201 Created`: Returns a success message along with the username and default membership status (`regular`).
    - `400 Bad Request`: If the username already exists, returns an error message.
  - **Example Request Body:**
    ```json
    {
      "username": "john_doe",
      "password": "securePassword123"
    }
    ```

- **POST /api/users/login** - Authenticate a user and return a JWT token

  - **Request Body:**
    - `username` (string, required): The username of the user trying to log in.
    - `password` (string, required): The password of the user.
  - **Response:**
    - `200 OK`: Returns the JWT token and the username.
    - `401 Unauthorized`: If the username or password is incorrect, returns an error message.
  - **Example Request Body:**
    ```json
    {
      "username": "john_doe",
      "password": "securePassword123"
    }
    ```

- **POST /api/users/promote/:status** - Promote a user to a different membership status (requires JWT)
  - **Headers:**
    - `Authorization` (string, required): The JWT token in the format `Bearer <token>`.
  - **Request Parameters:**
    - `:status` (string, required): The desired membership status (`member` or `admin`).
  - **Request Body:**
    - `passcode` (string, required): The passcode needed to promote to the specified status.
  - **Response:**
    - `200 OK`: Returns a success message with the updated membership status.
    - `400 Bad Request`: If the user is already at the requested status, returns an error message.
    - `401 Unauthorized`: If the passcode is incorrect, returns an error message.
    - `403 Forbidden`: If the user attempts to promote to an invalid status or demote from admin.
  - **Example Request Body:**
    ```json
    {
      "passcode": "memberPasscode123"
    }
    ```

### Comment Routes

- **GET /api/comments/** - Get all comments (requires JWT)

  - **Headers:**
    - `Authorization` (string, required): The JWT token in the format `Bearer <token>`.
  - **Response:**
    - `200 OK`: Returns an array of comments. The content varies based on the user's membership status:
      - `regular`: Returns the comment text and date only.
      - `member` and `admin`: Returns the comment text, author’s username, and date.
  - **Example Response:**
    ```json
    [
      {
        "text": "This is a comment",
        "author": "john_doe",
        "dateCreated": "2024-08-12T10:00:00Z"
      }
    ]
    ```

- **POST /api/comments/** - Create a new comment (requires JWT)

  - **Headers:**
    - `Authorization` (string, required): The JWT token in the format `Bearer <token>`.
  - **Request Body:**
    - `text` (string, required): The content of the comment.
  - **Response:**
    - `200 OK`: Returns a success message with the newly created comment.
    - `500 Internal Server Error`: If there is a server error, returns an error message.
  - **Example Request Body:**
    ```json
    {
      "text": "This is a new comment"
    }
    ```

- **DELETE /api/comments/:id** - Delete a comment by ID (requires JWT, only admins)
  - **Headers:**
    - `Authorization` (string, required): The JWT token in the format `Bearer <token>`.
  - **Request Parameters:**
    - `:id` (string, required): The ID of the comment to delete.
  - **Response:**
    - `200 OK`: Returns a success message with the deleted comment.
    - `403 Forbidden`: If the user is not an admin, returns an error message.
    - `500 Internal Server Error`: If there is a server error, returns an error message.
  - **Example Response:**
    ```json
    {
      "message": "Comment deleted successfully",
      "comment": {
        "text": "This is a comment",
        "author": "john_doe",
        "dateCreated": "2024-08-12T10:00:00Z"
      }
    }
    ```
