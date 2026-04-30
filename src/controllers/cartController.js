import Cart from '../models/Cart.js';
import { addToCart as addToCartImpl } from './consumerController.js';

// @desc    Get consumer cart
// @route   GET /api/cart
// @access  Private (consumer only)
const getCart = async (req, res) => {
  const cart = await Cart.findOne({ consumerId: req.user._id }).populate({
    path: 'items.produceId',
    select: 'productName category images pricePerKg unit farmerId',
    populate: {
      path: 'farmerId',
      select: 'fullName farmName profileImage',
    },
  });

  if (!cart) {
    return res.json({ consumerId: req.user._id, items: [], totalAmount: 0 });
  }

  res.json(cart);
};

// @desc    Remove item from cart (soft remove by produceId)
// @route   DELETE /api/cart/remove
// @access  Private (consumer only)
const removeFromCart = async (req, res) => {
  const { produceId } = req.body;

  if (!produceId) {
    res.status(400);
    throw new Error('produceId is required');
  }

  const cart = await Cart.findOne({ consumerId: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  cart.items = cart.items.filter((item) => item.produceId.toString() !== produceId);
  await cart.save();

  res.json({ message: 'Removed from cart', cart });
};

export { getCart, removeFromCart, addToCartImpl as addToCart };

