const express = require('express');
const { signup, login } = require('../controllers/authController');
const { getAllUsers, getUser } = require('../controllers/userController');

const router = express.Router();

/**
 * @swagger
 *  tags:
 *    name: Authentication
 *    description: Endpoints related to user authentication
 */

/**
 * @swagger
 *  /api/v1/users/signup:
 *    post:
 *      summary: Signup a user by entering email, password
 *      tags: [Authentication]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                username:
 *                  type: string
 *                  username: johndoe
 *                email:
 *                  type: string
 *                  example: user@gmail.com
 *                password:
 *                  type: string
 *                confirmPassword:
 *                  type: string
 *            required:
 *              - email
 *              - password
 *              - confirmPassword
 *      responses:
 *        200:
 *          description: user created successfully
 *        400:
 *          description: Bad request
 *        500:
 *          description: Internal Server Error
*/
router.post('/signup', signup);

/**
 * @swagger
 *  /api/v1/users/login:
 *    post:
 *      summary: Login with username/email and password
 *      tags: [Authentication]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                username:
 *                  type: string
 *                email:
 *                  type: string
 *                password:
 *                  type: string
 *      responses:
 *        200:
 *          description: Login success
 *        400:
 *          description: Bad request, invalid credentials
 *        500:
 *          description: Internal Server Error
 */
router.post('/login', login);

/**
 * @swagger
 *  tags:
 *    name: Users
 *    description: Endpoints related to Users CRUD operations
 */

/**
 * @swagger
 *  /api/v1/users:
 *    get:
 *      summary: Get all the users in the db
 *      tags: [Users]
 *      responses:
 *        200:
 *          description: got all the users
 *        500:
 *          description: Internal Server Error
 */
router.get('/', getAllUsers);


module.exports = router;
