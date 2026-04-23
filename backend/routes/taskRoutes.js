import express from 'express';
import { 
  createTask, 
  getMyTasks, 
  getAllTasksAdmin, 
  deleteTask ,
  updateTask
} from '../controllers/taskController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js'; 

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Tasks
 *     description: Task management for users and admins
 */

router.use(protect); 

/**
 * @swagger
 * /api/v1/tasks:
 *   post:
 *     summary: Create a new task (Authenticated)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Task created successfully
 */
router.post('/', createTask); 

/**
 * @swagger
 * /api/v1/tasks/my-tasks:
 *   get:
 *     summary: Get all tasks belonging to the logged-in user
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user tasks retrieved
 */
router.get('/my-tasks', getMyTasks); 

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   delete:
 *     summary: Delete a task (User can delete their own; Admin can delete any)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     responses:
 *       204:
 *         description: Task deleted successfully
 */
router.delete('/:id', deleteTask); 
/**
 * @swagger
 * /api/v1/tasks/admin/all-tasks:
 *   get:
 *     summary: Get all tasks from all users (Admin Only)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all system tasks retrieved
 */
router.get('/admin/all-tasks', restrictTo('admin'), getAllTasksAdmin);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   patch:
 *     summary: Update task status or details
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task updated successfully
 */
router.patch('/:id', updateTask);

export default router;