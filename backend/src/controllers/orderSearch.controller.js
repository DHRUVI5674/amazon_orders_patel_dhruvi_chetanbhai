import Order from "../models/order.model.js";

/**
 * Utility: build regex search
 */
const buildRegex = (q) => new RegExp(q, "i");

/* -----------------------------
   1. GENERAL SEARCH
------------------------------ */
export const searchOrders = async (req, res) => {
  try {
    const q = req.query.q;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query (q) is required",
      });
    }

    const regex = new RegExp(q, "i");
    const orders = await Order.find({
      $or: [
        { OrderID: { $regex: regex } },
        { CustomerName: { $regex: regex } },
        { ProductName: { $regex: regex } },
        { Category: { $regex: regex } },
        { Brand: { $regex: regex } },
        { City: { $regex: regex } },
      ],
    });

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
/* -----------------------------
   2. SEARCH BY CUSTOMER
------------------------------ */
export const searchByCustomer = async (req, res) => {
  try {
    const q = req.query.q;

    console.log("Search query:", q);

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Query parameter 'q' is required",
      });
    }

    const data = await Order.find({
      CustomerName: new RegExp(q, "i"),
    });

    console.log("Result:", data);

    res.json({ success: true, data });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
/* -----------------------------
   3. PRODUCT SEARCH
------------------------------ */
export const searchByProduct = async (req, res) => {
  try {
    const q = req.query.q;
    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Query parameter 'q' is required",
      });
    }

    console.log("Search Product:", q);

    const regex = new RegExp(q, "i");
    const data = await Order.find({
      ProductName: { $regex: regex },
    });

    console.log("Found:", data.length);

    res.json({
      success: true,
      count: data.length,
      data,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
/* -----------------------------
   4. CATEGORY SEARCH
------------------------------ */
export const searchByCategory = async (req, res) => {
  try {
    const q = req.query.q;

    const data = await Order.find({
      Category: buildRegex(q),
    });

    res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* -----------------------------
   5. BRAND SEARCH
------------------------------ */
export const searchByBrand = async (req, res) => {
  try {
    const q = req.query.q;

    const regex = q ? new RegExp(q, "i") : /.*/;

    const data = await Order.find({
      Brand: regex,
    });

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* -----------------------------
   6. STATUS SEARCH
------------------------------ */
export const searchByStatus = async (req, res) => {
  const q = req.query.q;

  const data = await Order.find({
    OrderStatus: buildRegex(q),
  });

  res.json({ success: true, data });
};

/* -----------------------------
   7. PAYMENT SEARCH
------------------------------ */
export const searchByPayment = async (req, res) => {
  const q = req.query.q;

  const data = await Order.find({
    PaymentMethod: buildRegex(q),
  });

  res.json({ success: true, data });
};

/* -----------------------------
   8. LOCATION SEARCH
------------------------------ */
export const searchByLocation = async (req, res) => {
  try {
    const q = req.query.q;

    const regex = q ? new RegExp(q, "i") : /.*/;

    const data = await Order.find({
      $or: [
        { City: regex },
        { State: regex },
        { Country: regex },
      ],
    });

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* -----------------------------
   9. DATE SEARCH
------------------------------ */
export const searchByDate = async (req, res) => {
  try {
    const q = req.query.q;

    const data = await Order.find({
      OrderDate: q, // ✅ exact match (string)
    });

    res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
/* -----------------------------
   10. TRACKING SEARCH
   (if you later add trackingId field)
------------------------------ */
export const searchByTracking = async (req, res) => {
  try {
    const q = req.query.q;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Please provide SellerID",
      });
    }

    const data = await Order.find({
      SellerID: { $regex: `^${q.trim()}$`, $options: "i" }, // ✅ exact match (case-insensitive)
    });

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
/* -----------------------------
   11. FUZZY SEARCH
------------------------------ */
export const fuzzySearch = async (req, res) => {
  try {
    const q = req.query.q;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Please provide a search query",
      });
    }

    const regex = new RegExp(q.trim(), "i"); // ✅ safe regex

    const data = await Order.find({
      $or: [
        { ProductName: regex },
        { CustomerName: regex },
        { Category: regex },
      ],
    });

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* -----------------------------
   12. AUTOCOMPLETE
------------------------------ */
export const autocompleteSearch = async (req, res) => {
  const q = req.query.q;

  const data = await Order.find(
    {
      ProductName: buildRegex(q),
    },
    { ProductName: 1, OrderID: 1 }
  ).limit(10);

  res.json({ success: true, data });
};

/* -----------------------------
   13. HIGHLIGHT SEARCH
------------------------------ */
export const highlightSearch = async (req, res) => {
  const q = req.query.q;

  const data = await Order.find({
    ProductName: buildRegex(q),
  });

  const highlighted = data.map((item) => ({
    ...item._doc,
    ProductName: item.ProductName.replace(
      new RegExp(q, "i"),
      (match) => `<mark>${match}</mark>`
    ),
  }));

  res.json({ success: true, data: highlighted });
};

/* -----------------------------
   14. RECENT SEARCH (mock logic)
------------------------------ */
export const recentSearch = async (req, res) => {
  const data = await Order.find()
    .sort({ createdAt: -1 })
    .limit(10);

  res.json({ success: true, data });
};

/* -----------------------------
   15. POPULAR SEARCH (mock logic)
------------------------------ */
export const popularSearch = async (req, res) => {
  const data = await Order.aggregate([
    {
      $group: {
        _id: "$ProductName",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  res.json({ success: true, data });
};