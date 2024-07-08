const express = require('express');
const { signup, login, protect, forgotPassword, resetPassword, updatePassword, restrictTo } = require('../controllers/authController');
const { getAllUsers, getUser, updateUser, deleteUser, updateMe, deleteMe } = require('../controllers/userController');

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
 *  /api/v1/users/forgotPassword:
 *    post:
 *      summary: Get the password reset token link on mail
 *      tags: [Authentication]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                email:
 *                  type: string
 *                  required: true
 *      responses:
 *        200:
 *          description: Password reset token sent on the user email
 *        404:
 *          description: User not found
 *        500:
 *          description: Internal Server Error
 */
router.post('/forgotPassword', forgotPassword);

/**
 * @swagger
 *  /api/v1/users/resetPassword/{resetToken}:
 *    patch:
 *      summary: Reset the password by creating a new password
 *      tags: [Authentication]
 *      parameters:
 *        - in: path
 *          name: resetToken
 *          required: true
 *          schema:
 *            type: string
 *          description: The password reset token which was received on mail
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                password:
 *                  type: string
 *                confirmPassword:
 *                  type: string
 *              required:
 *                  - password
 *                  - confirmPassword
 *      responses:
 *        200:
 *          description: Password Reset successfully
 *        400:
 *          description: Bad request
 *        500:
 *          description: Internal Server Error
 */
router.patch('/resetPassword/:resetToken', resetPassword);

/**
 * @swagger
 *  /api/v1/users/updatePassword:
 *    patch:
 *      summary: Update the current password
 *      tags: [Authentication]
 *      security:
 *        - bearerAuth: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                currentPassword:
 *                  type: string
 *                newPassword:
 *                  type: string
 *                confirmNewPassword:
 *                  type: string
 *              required:
 *                - currentPassword
 *                - newPassword
 *                - confirmNewPassword
 *      responses:
 *        200:
 *          description: Password Updated successfully
 *        400:
 *          description: Bad request
 *        500:
 *          description: Internal Server Error
 */
router.patch('/updatePassword', protect, updatePassword);

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
 *      security:
 *        - bearerAuth: []
 *      responses:
 *        200:
 *          description: got all the users
 *        500:
 *          description: Internal Server Error
 */
router.get('/', protect, restrictTo('admin', 'developer'), getAllUsers);

/**
 * @swagger
 *  /api/v1/users/{id}:
 *    get:
 *      summary: Get single user from db using id
 *      tags: [Users]
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: The id of the user
 *      security:
 *        - bearerAuth: []
 *      responses:
 *        200:
 *          description: got the user
 *        404:
 *          description: user not found
 *        500:
 *          description: Internal Server Error
 */
router.get('/:id', protect, restrictTo('admin', 'developer'), getUser);


/**
 * @swagger
 *  /api/v1/users/{id}:
 *    patch:
 *      summary: Update the user using user ID
 *      tags: [Users]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: The user ID of the user to be updated
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                name:
 *                  type: string
 *                username:
 *                  type: string
 *      responses:
 *        200:
 *          description: User updated successfully
 *        400:
 *          description: Bad request
 *        500:
 *          description: Internal Server Error
 */
router.patch('/:id', protect, restrictTo('admin', 'developer'), updateUser);


/**
 * @swagger
 *  /api/v1/users/{id}:
 *    delete:
 *      summary: Delete a user using user ID
 *      tags: [Users]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: The user ID of the user to be updated
 *      responses:
 *        204:
 *          description: User deleted successfully
 *        400:
 *          description: Bad request
 *        500:
 *          description: Internal Server Error
 */
router.delete('/:id', protect, restrictTo('admin', 'developer'), deleteUser);



/**
 * @swagger
 *  /api/v1/users/updateMe:
 *    patch:
 *      summary: User updates its own details (allowed fields only, only admin can modify all the fields)
 *      tags: [Users]
 *      security:
 *        - bearerAuth: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                name:
 *                  type: string
 *                username:
 *                  type: string
 *      responses:
 *        200:
 *          description: User updated successfully
 *        400:
 *          description: Bad request
 *        500:
 *          description: Internal Server Error
 */
router.patch('/updateMe', protect, updateMe);

/**
 * @swagger
 *  /api/v1/users/deleteMe:
 *    delete:
 *      summary: User deletes itself (only makes the user inactive, Only admin have deletion rights)
 *      tags: [Users]
 *      security:
 *        - bearerAuth: []
 *      responses:
 *        204:
 *          description: User deleted successfully
 *        400:
 *          description: Bad request
 *        500:
 *          description: Internal Server Error
 */
router.delete('/deleteMe', protect, deleteMe);

module.exports = router;
