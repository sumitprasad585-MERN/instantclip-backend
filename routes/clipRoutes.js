const express = require('express');
const Clip = require('../models/clipModel');
const { getAllClips, createNewClip, updateClip, deleteClip, getClip } = require('../controllers/clipController');
const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router();

/**
 * @swagger
 *  tags:
 *    name: Clips
 *    description: Endpoints related with Clips API
 */

/**
 * @swagger
 * /api/v1/clips/:
 *  get:
 *    summary: Get All Clips
 *    tags: [Clips]
 *    description: Get all the clips
 *    security:
 *      - bearerAuth: []
 *    responses:
 *      200:
 *        description: OK
 *      401:
 *        description: Unauthorized, Please login
 *      500:
 *        description: Internal Server Error
 */
router.get('/', protect, getAllClips);

/**
 * @swagger
 * /api/v1/clips/{id}:
 *  get:
 *    summary: Get Clip
 *    tags: [Clips]
 *    description: Get a single clip using ID
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
 *        description: Got the clip
 *      401:
 *        description: Unauthorized, Please login
 *      404:
 *        description: Clip Not Found
 *      500:
 *        description: Internal Server Error
 */
router.get('/:id', protect, getClip);

/**
 * @swagger
 * /api/v1/clips:
 *  post:
 *    summary: Create a Clip
 *    tags: [Clips]
 *    description: Create a new clip
 *    security:
 *      - bearerAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              data:
 *                type: string
 *              datatype:
 *                type: string
 *              fontSize:
 *                type: number
 *              listScore:
 *                type: number
 *            required:
 *              - data
 *    responses:
 *      201:
 *        description: Clip Created
 *      401:
 *        description: Unauthorized, Please login
 *      500:
 *        description: Internal Server Error
 */
router.post('/', protect, createNewClip);

/**
 * @swagger
 * /api/v1/clips/{id}:
 *  patch:
 *    summary: Update a Clip
 *    tags: [Clips]
 *    description: Update a clip
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
 *              data:
 *                type: string
 *              label:
 *                type: string
 *              fontSize:
 *                type: number
 *              listScore:
 *                type: number
 *            required:
 *    responses:
 *      200:
 *        description: Clip Updated
 *      401:
 *        description: Unauthorized, Please login
 *      500:
 *        description: Internal Server Error
 */
router.patch('/:id', protect, updateClip);

/**
 * @swagger
 * /api/v1/clips/{id}:
 *  delete:
 *    summary: Delete a clip
 *    tags: [Clips]
 *    description: Delete a clip using ID
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
 *        description: Clip Deleted
 *      401:
 *        description: Unauthorized, Please login
 *      500:
 *        description: Internal Server Error
 */
router.delete('/:id', protect, deleteClip);

module.exports = router;
