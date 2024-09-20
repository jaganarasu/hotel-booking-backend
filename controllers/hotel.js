import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";

export const createHotel = async (req, res, next) => {
  const newHotel = new Hotel(req.body);

  try {
    const savedHotel = await newHotel.save();
    res.status(200).json(savedHotel);
  } catch (err) {
    next(err);
  }
};
export const updateHotel = async (req, res, next) => {
  try {
    const updatedHotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedHotel);
  } catch (err) {
    next(err);
  }
};
export const deleteHotel = async (req, res, next) => {
  try {
    await Hotel.findByIdAndDelete(req.params.id);
    res.status(200).json("Hotel has been deleted.");
  } catch (err) {
    next(err);
  }
};
export const getHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    res.status(200).json(hotel);
  } catch (err) {
    next(err);
  }
};
// export const getHotels = async (req, res, next) => {
//   const { min, max, ...others } = req.query;
//   try {
//     const hotels = await Hotel.find({
//       ...others,
//       cheapestPrice: { $gt: min | 1, $lt: max || 999 },
//     }).limit(req.query.limit);
//     res.status(200).json(hotels);
//   } catch (err) {
//     next(err);
//   }
// };

// export const getHotels = async (req, res, next) => {
//   const { min, max, ...others } = req.query;

//   try {
//     const hotels = await Hotel.find({
//       ...others,
//       cheapestPrice: { 
//         $gt: min ? Number(min) : 1, 
//         $lt: max ? Number(max) : 999 
//       },
//     }).limit(Number(req.query.limit) || 10); // Adding a default limit
//     res.status(200).json(hotels);
//   } catch (err) {
//     next(err);
//   }
// };

// export const getHotels = async (req, res, next) => {
//   const { min, max, limit, ...others } = req.query;

//   try {
//     // Parse min, max, and limit to numbers
//     const minPrice = min ? Number(min) : 1;
//     const maxPrice = max ? Number(max) : 999;
//     const limitResults = limit ? Number(limit) : 10;

//     // Filter undefined or invalid fields from `others`
//     const validQuery = {};
//     for (const key in others) {
//       if (others[key]) {
//         validQuery[key] = others[key];
//       }
//     }

//     const hotels = await Hotel.find({
//       ...validQuery,
//       cheapestPrice: { 
//         $gt: minPrice, 
//         $lt: maxPrice 
//       },
//     }).limit(limitResults);

//     res.status(200).json(hotels);
//   } catch (err) {
//     next(err);
//   }
// };

// export const getHotels = async (req, res, next) => {
//   const { min, max, limit, city, ...others } = req.query;

//   try {
//     // Parse min, max, and limit to numbers
//     const minPrice = min ? Number(min) : 1;
//     const maxPrice = max ? Number(max) : 999;
//     const limitResults = limit ? Number(limit) : 10;

//     // Filter undefined or invalid fields from `others`
//     const validQuery = {};
//     for (const key in others) {
//       if (others[key]) {
//         validQuery[key] = others[key];
//       }
//     }

//     // Handle min and max conditions
//     const priceFilter = {};
//     if (minPrice >= 0) {
//       priceFilter.$gt = minPrice;
//     }
//     if (maxPrice >= 0) {
//       priceFilter.$lt = maxPrice;
//     }

//     // Build the query with city filter if provided
//     const hotels = await Hotel.find({
//       ...validQuery,
//       cheapestPrice: priceFilter,
//       ...(city && { city }), // Include city in query if it's provided
//     }).limit(limitResults);

//     res.status(200).json(hotels);
//   } catch (err) {
//     next(err);
//   }
// };

export const getHotels = async (req, res, next) => {
  const { min, max, limit, city, ...others } = req.query;

  try {
    // Parse min, max, and limit to numbers
    const minPrice = min ? Number(min) : 1;
    const maxPrice = max ? Number(max) : 999;
    const limitResults = limit ? Number(limit) : 10;

    // Filter undefined or invalid fields from `others`
    const validQuery = {};
    for (const key in others) {
      if (others[key]) {
        validQuery[key] = others[key];
      }
    }

    // Handle min and max conditions
    const priceFilter = {};
    if (minPrice >= 0) {
      priceFilter.$gt = minPrice;
    }
    if (maxPrice >= 0) {
      priceFilter.$lt = maxPrice;
    }

    // Build the query with city filter if provided
    const query = {
      ...validQuery,
      cheapestPrice: priceFilter,
      ...(city && { city }), // Include city in query if it's provided
    };

    console.log("Query being executed:", query); // Debug log

    const hotels = await Hotel.find(query).limit(limitResults);

    res.status(200).json(hotels);
  } catch (err) {
    console.error("Error fetching hotels:", err); // Error log
    next(err);
  }
};



// export const countByCity = async (req, res, next) => {
//   const cities = req.query.cities ? req.query.cities.split(",") : []; // Ensure cities is an array

//   try {
//     const list = await Promise.all(
//       cities.map((city) => {
//         return Hotel.countDocuments({ city: city });
//       })
//     );
//     res.status(200).json(list);
//   } catch (err) {
//     next(err);
//   }
// };


export const countByCity = async (req, res, next) => {
  try {
    const result = await Hotel.aggregate([
      {
        $group: {
          _id: "$city", // Group by city
          count: { $sum: 1 } // Count the number of hotels in each city
        }
      },
      {
        $project: {
          _id: 0, // Exclude the default `_id` field
          city: "$_id", // Rename `_id` to `city`
          count: 1 // Include the count
        }
      }
    ]);

    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const getHotelsByCityAndPrice = async (req, res, next) => {
  // Extract city, min, and max from query parameters
  const { city, min, max } = req.query;

  // Validate the required parameters
  if (!city) {
    return res.status(400).json({ success: false, message: "City parameter is required." });
  }

  // Convert min and max to numbers, setting default values if not provided
  const minPrice = min ? Number(min) : 0;
  const maxPrice = max ? Number(max) : Number.MAX_SAFE_INTEGER; // Use a large number if max is not provided

  try {
    // Fetch hotels based on city and price range
    const hotels = await Hotel.find({
      city: city,
      price: { $gte: minPrice, $lte: maxPrice }
    });

    res.status(200).json({ success: true, data: hotels });
  } catch (err) {
    next(err);
  }
};

// export const countByCity = async (req, res, next) => {
//   try {
//     // Check if cities query exists and is not empty
//     // if (!req.query.cities || req.query.cities.trim() === "") {
//     //   return res.status(400).json({ message: "Cities query parameter is required" });
//     // }

//     // Check if the query is a single city or multiple cities separated by commas
//     let cities;
//     if (req.query.cities.includes(",")) {
//       cities = req.query.cities.split(",").map(city => city.trim()); // Split and trim if multiple cities
//     } else {
//       cities = [req.query.cities.trim()]; // If it's a single city, place it in an array
//     }

//     // Use Promise.all to count documents for each city
//     const list = await Promise.all(
//       cities.map((city) => Hotel.countDocuments({ city: city }))
//     );

//     res.status(200).json(list);
//   } catch (err) {
//     next(err);
//   }
// };

// export const countByCity = async (req, res, next) => {
//   try {
//     // Check if cities query exists and is not empty
//     const citiesQuery = req.query.cities;
    
  

//     // Check if the query is a single city or multiple cities separated by commas
//     let cities;
//     if (citiesQuery.includes(",")) {
//       cities = citiesQuery.split(",").map(city => city.trim()); // Split and trim if multiple cities
//     } else {
//       cities = [citiesQuery.trim()]; // If it's a single city, place it in an array
//     }

//     // Use Promise.all to count documents for each city
//     const list = await Promise.all(
//       cities.map((city) => Hotel.countDocuments({ city: city }))
//     );

//     res.status(200).json(list);
//   } catch (err) {
//     next(err);
//   }
// };


// export const countByCity = async (req, res, next) => {
//   try {
//     // Capture the cities query parameter
//     const citiesQuery = req.query.cities;

//     // Check if the citiesQuery is not defined or is not a string
//     if (!citiesQuery || typeof citiesQuery !== 'string' || citiesQuery.trim() === "") {
//       return res.status(400).json({ message: "Cities query parameter is required" });
//     }

//     // Split cities based on commas
//     const cities = citiesQuery.split(",").map(city => city.trim()).filter(city => city); // Trim and filter out empty values

//     // Use Promise.all to count documents for each city
//     const list = await Promise.all(
//       cities.map((city) => Hotel.countDocuments({ city: city }))
//     );

//     res.status(200).json(list);
//   } catch (err) {
//     console.error(err); // Log the error for debugging
//     next(err);
//   }
// };



export const countByType = async (req, res, next) => {
  try {
    const hotelCount = await Hotel.countDocuments({ type: "hotel" });
    const apartmentCount = await Hotel.countDocuments({ type: "apartment" });
    const resortCount = await Hotel.countDocuments({ type: "resort" });
    const villaCount = await Hotel.countDocuments({ type: "villa" });
    const cabinCount = await Hotel.countDocuments({ type: "cabin" });

    res.status(200).json([
      { type: "hotel", count: hotelCount },
      { type: "apartments", count: apartmentCount },
      { type: "resorts", count: resortCount },
      { type: "villas", count: villaCount },
      { type: "cabins", count: cabinCount },
    ]);
  } catch (err) {
    next(err);
  }
};

export const getHotelRooms = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    const list = await Promise.all(
      hotel.rooms.map((room) => {
        return Room.findById(room);
      })
    );
    res.status(200).json(list);
  } catch (err) {
    next(err);
  }
};
