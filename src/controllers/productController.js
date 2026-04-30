import Produce from '../models/Produce.js';
import { calculateDistanceKm } from '../utils/haversine.js';

// @desc    Get product details by id
// @route   GET /api/products/:id
// @access  Private (auth) not required for browsing in mobile app
const getProductById = async (req, res) => {
  const { id } = req.params;
  const { lat, lng } = req.query;

  const product = await Produce.findById(id).populate(
    'farmerId',
    'fullName farmName profileImage phoneNumber farmAddress location'
  );

  if (!product || product.isDeleted) {
    res.status(404);
    throw new Error('Product not found');
  }

  let distanceKm = null;
  if (
    lat !== undefined &&
    lng !== undefined &&
    product.location &&
    Array.isArray(product.location.coordinates)
  ) {
    const [productLng, productLat] = product.location.coordinates;
    distanceKm = calculateDistanceKm(
      parseFloat(lat),
      parseFloat(lng),
      parseFloat(productLat),
      parseFloat(productLng)
    ).toFixed(2);
  }

  res.json({
    product,
    farmer: product.farmerId,
    distanceKm,
  });
};

export { getProductById };

