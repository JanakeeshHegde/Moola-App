import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';
import { ProductController } from '../controllers/productController';

const router = Router();

/**
 * GET /api/v1/products — Search & List products
 */
router.get('/', optionalAuth, asyncHandler(ProductController.listProducts));

/**
 * GET /api/v1/products/my — Seller's products
 */
router.get('/my', authenticate, authorize('seller'), asyncHandler(ProductController.getMyProducts));

/**
 * GET /api/v1/products/:id — Product detail
 */
router.get('/:id', optionalAuth, asyncHandler(ProductController.getProductById));

/**
 * POST /api/v1/products — Create product
 */
router.post('/', authenticate, authorize('seller'), asyncHandler(ProductController.createProduct));

/**
 * PATCH /api/v1/products/:id — Update product
 */
router.patch(
  '/:id',
  authenticate,
  authorize('seller', 'admin'),
  asyncHandler(ProductController.updateProduct),
);

/**
 * DELETE /api/v1/products/:id — Delete product
 */
router.delete(
  '/:id',
  authenticate,
  authorize('seller', 'admin'),
  asyncHandler(ProductController.deleteProduct),
);

export default router;
