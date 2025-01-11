const express = require('express');
const { signup, login, forgotPassword, resetPassword, updatePassword, protect, restrictTo, refreshAccessToken, logout } = require('../controllers/authController');
const { getAllUsers, getUser, updateUser, updateMe, deleteUser, deleteMe } = require('../controllers/userController');

const router = express.Router();

/**
 * @swagger
 *  tags:
 *    name: Authentication
 *    description: Endpoints related to Authentication
 */


/**
 * @swagger
 * /api/v1/users/signup:
 *  post:
 *    summary: Signup
 *    tags: [Authentication]
 *    description: Signup using email
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *              username:
 *                type: string
 *              password:
 *                type: string
 *              confirmPassword:
 *                type: string
 *            required:
 *              - email
 *              - password
 *              - confirmPassword
 *    responses:
 *      200:
 *        description: Signup Successful, user created
 *      400:
 *        description: Bad Request
 *      500:
 *        description: Internal Server Error
 */
router.post('/signup', signup);

/**
 * @swagger
 * /api/v1/users/login:
 *  post:
 *    summary: Login
 *    tags: [Authentication]
 *    description: Login using email/username and password
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              username:
 *                type: string
 *              email:
 *                type: string
 *              password:
 *                type: string
 *            required:
 *              - password
 *    responses:
 *      200:
 *        description: Logged In Successfully
 *      400:
 *        description: Bad Request
 *      404:
 *        description: User not Found
 *      500:
 *        description: Internal Server Error
 */
router.post('/login', login);


/**
 * @swagger
 * /api/v1/users/forgotPassword:
 *  post:
 *    summary: Forgot Password
 *    tags: [Authentication]
 *    description: Get Reset Password Link on registered email
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *              username:
 *                type: string
 *            required:
 *              - email
 *              - username
 *    responses:
 *      200:
 *        description: Password reset link sent to user's mail
 *      400:
 *        description: Bad Request
 *      404:
 *        description: User not Found
 *      500:
 *        description: Internal Server Error
 */
router.post('/forgotPassword', forgotPassword);

/**
 * @swagger
 * /api/v1/users/resetPassword/{resetToken}:
 *  patch:
 *    summary: Reset Password
 *    tags: [Authentication]
 *    description: Reset the password using the reset token
 *    parameters:
 *      - in: path
 *        name: resetToken
 *        required: true
 *        schema:
 *          type: string
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              password:
 *                type: string
 *              confirmPassword:
 *                type: string
 *            required:
 *              - password
 *              - confirmPassword
 *    responses:
 *      200:
 *        description: Password reset successfuly
 *      400:
 *        description: Bad Request
 *      500:
 *        description: Internal Server Error
 */
router.patch('/resetPassword/:resetToken', resetPassword);

/**
 * @swagger
 * /api/v1/users/updatePassword:
 *  patch:
 *    summary: Update Password
 *    tags: [Authentication]
 *    description: Update password by entering current and new password
 *    security:
 *      - bearerAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              currentPassword:
 *                type: string
 *              newPassword:
 *                type: string
 *              confirmNewPassword:
 *                type: string
 *            required:
 *              - currentPassword
 *              - newPassword
 *              - confirmNewPassword
 *    responses:
 *      200:
 *        description: Password updated successfully
 *      400:
 *        description: Bad Request
 *      500:
 *        description: Internal Server Error
 */
router.patch('/updatePassword', protect, updatePassword);

/**
 * @swagger
 * /api/v1/users/renewToken:
 *  post:
 *    summary: Renew the access token using refresh token
 *    tags: [Authentication]
 *    description: Renew the access token using refresh token
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              refresh_token:
 *                type: string
 *            required:
 *              - refresh_token
 *    responses:
 *      200:
 *        description: OK, Refreshed the access token
 *      400:
 *        description: Bad request
 *      401:
 *        description: Unauthorized, Please login
 *      500:
 *        description: Internal server error, something went wrong
 *
 */
router.post('/refreshToken', refreshAccessToken);

/**
 * @swagger
 * /api/v1/users/logout:
 *  post:
 *    summary: Logout user
 *    tags: [Authentication]
 *    description: Unset the refresh token of user in DB on logout
 *    response:
 *      200:
 *        description: OK
 *      400:
 *        description: Bad request
 *      500:
 *        description: Internal server error, something went wrong
 */
router.post('/logout', protect, logout);


/**
 * @swagger
 *  tags:
 *    name: Users API
 *    description: Endpoints related to Users API
 */

/**
 * @swagger
 * /api/v1/users:
 *  get:
 *    summary: Get all users
 *    tags: [Users API]
 *    description: Get all the users
 *    security:
 *      - bearerAuth: []
 *    responses:
 *      200:
 *        description: Got all the users
 *      401:
 *        description: Unauthorized, Please login.
 *      500:
 *        description: Internal Server Error
 */
router.get('/', protect, restrictTo('admin', 'developer', 'moderator'), getAllUsers);

/**
 * @swagger
 * /api/v1/users/{id}:
 *  get:
 *    summary: Get all users
 *    tags: [Users API]
 *    description: Get all the users
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: Got the user
 *      401:
 *        description: Unauthorized, Please login.
 *      404:
 *        description: User not found
 *      500:
 *        description: Internal Server Error
 */
router.get('/:id', protect, restrictTo('admin', 'developer', 'moderator'), getUser);

/**
 * @swagger
 * /api/v1/users/updateMe:
 *  patch:
 *    summary: Update user [For User]
 *    tags: [Users API]
 *    description: User updates limited fields
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              name:
 *                type: string
 *              username:
 *                type: string
 *    responses:
 *      200:
 *        description: User Updated
 *      401:
 *        description: Unauthorized, Please login.
 *      500:
 *        description: Internal Server Error
 */
router.patch('/updateMe', protect, updateMe);

/**
 * @swagger
 * /api/v1/users/{id}:
 *  patch:
 *    summary: Update user [For Admin]
 *    tags: [Users API]
 *    description: Update the user based on user ID
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              name:
 *                type: string
 *              username:
 *                type: string
 *              role:
 *                type: string
 *    responses:
 *      200:
 *        description: User Updated
 *      401:
 *        description: Unauthorized, Please login.
 *      500:
 *        description: Internal Server Error
 */
router.patch('/:id', protect, restrictTo('admin', 'developer', 'moderator'), updateUser);

/**
 * @swagger
 * /api/v1/users/deleteMe:
 *  delete:
 *    summary: Delete User [For User]
 *    tags: [Users API]
 *    description: Delete the user
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *    responses:
 *      204:
 *        description: User Deleted
 *      401:
 *        description: Unauthorized, Please login.
 *      500:
 *        description: Internal Server Error
 */
router.delete('/deleteMe', protect, deleteMe);

/**
 * @swagger
 * /api/v1/users/{id}:
 *  delete:
 *    summary: Delete User [For Admin]
 *    tags: [Users API]
 *    description: Delete the user based on user id
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *    responses:
 *      204:
 *        description: User Deleted
 *      401:
 *        description: Unauthorized, Please login.
 *      500:
 *        description: Internal Server Error
 */
router.delete('/:id', protect, restrictTo('admin', 'developer', 'moderator'), deleteUser);

module.exports = router;
