const express = require('express');
const { signup, login, forgotPassword, resetPassword, updatePassword, protect, restrictTo } = require('../controllers/authController');
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

router.get('/', protect, restrictTo('admin', 'developer', 'moderator'), getAllUsers);

router.get('/:id', protect, restrictTo('admin', 'developer', 'moderator'), getUser);

router.patch('/updateMe', protect, updateMe);

router.patch('/:id', protect, restrictTo('admin', 'developer', 'moderator'), updateUser);

router.delete('/deleteMe', protect, deleteMe);

router.delete('/:id', protect, restrictTo('admin', 'developer', 'moderator'), deleteUser);

module.exports = router;
