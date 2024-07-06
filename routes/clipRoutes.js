const express = require('express');
const { getAllClips, getClip, createClip, updateClip, deleteClip } = require('../controllers/clipController');

const router = express.Router();

/**
 * @swagger
 *  tags:
 *    name: Clips
 *    description: Endpoints related to clips
 */

/**
 * @swagger
 * /api/v1/clips:
 *  get:
 *    summary: Get all clips
 *    tags: [Clips]
 *    responses:
 *      200:
 *        description: Got all the clips
 *      500:
 *        description: Internal Server Error
 */
router.get('/', getAllClips);

/**
 * @swagger
 * /api/v1/clips/{id}:
 *  get:
 *    summary: Get a single clip
 *    tags: [Clips]
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *        description: The user id of the user
 *    responses:
 *      200:
 *        description: Got the desired clip
 *      404:
 *        description: clip not found
 *      500:
 *        description: Internal Server Error
 */
router.get('/:id', getClip);

/**
 * @swagger
 * /api/v1/clips:
 *  post:
 *    summary: Create a new clip
 *    tags: [Clips]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              label:
 *                type: string
 *                example: Password
 *              text:
 *                type: string
 *                required: true
 *                example: Some text here
 *              fontSize:
 *                type: number
 *                example: 14
 *              color:
 *                type: string
 *                example: Color name or hex string for color
 *              type:
 *                type: string
 *                example: "plaintext"
 *              category:
 *                type: array
 *                items:
 *                  type: string
 *                example: [""]
 *    responses:
 *      200:
 *        description: Clip created successfully
 *      400:
 *        description: Bad request
 *      500:
 *        description: Internal Server Error
 */
router.post('/', createClip);

/**
 * @swagger
 *  /api/v1/clips/{id}:
 *    patch:
 *      summary: Update a clip
 *      tags: [Clips]
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: The user id of the user
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *            properties:
 *              label:
 *                type: string
 *              text:
 *                type: string
 *              clipScore:
 *                type: number
 *              fontSize:
 *                type: number
 *      responses:
 *        200:
 *          description: Update successful
 *        400:
 *          description: Bad request
 *        404:
 *          description: Clip not found
 *        500:
 *          description: Internal Server Error
 */
router.patch('/:id', updateClip);

/**
 * @swagger
 *  /api/v1/clips/{id}:
 *    delete:
 *      summary: Delete a clip
 *      tags: [Clips]
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: The user id of the user
 *      responses:
 *        204:
 *          description: clip deleted successfully
 *        500:
 *          description: Internal Server Error
 */
router.delete('/:id', deleteClip);

module.exports = router;
