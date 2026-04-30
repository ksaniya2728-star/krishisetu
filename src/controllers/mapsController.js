import { calculateDistanceKm } from '../utils/haversine.js';

// @desc    Calculate distance between farmer and consumer
// @route   POST /api/maps/distance
// @access  Public or Private
const calculateDistance = async (req, res) => {
  const { sourceLat, sourceLng, destLat, destLng } = req.body;

  if (
    sourceLat === undefined || sourceLng === undefined ||
    destLat === undefined || destLng === undefined
  ) {
    res.status(400);
    throw new Error('Please provide source and destination coordinates');
  }

  const distanceKm = calculateDistanceKm(
    parseFloat(sourceLat), parseFloat(sourceLng),
    parseFloat(destLat), parseFloat(destLng)
  );

  // Rough estimate: average speed 30 km/h in city
  const estimatedTimeHours = distanceKm / 30;
  const estimatedTimeMins = Math.round(estimatedTimeHours * 60);

  res.json({
    distanceKm: distanceKm.toFixed(2),
    estimatedTime: `${estimatedTimeMins} minutes`
  });
};

export { calculateDistance };
