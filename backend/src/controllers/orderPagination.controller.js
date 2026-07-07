import Order from "../models/order.model.js";

/* =========================
   COMMON PAGINATION HELPER
========================= */
const getPagination = (req) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.max(parseInt(req.query.limit) || 10, 1);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/* =========================
   COMMON RESPONSE HANDLER
========================= */
const buildResponse = async (res, query, page, limit) => {
  const skip = (page - 1) * limit;

  const total = await Order.countDocuments(query);

  const data = await Order.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ OrderDate: -1 }); // your schema uses string date

  return res.json({
    success: true,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    count: data.length,
    data,
  });
};

/* =====================================================
   1. STANDARD PAGINATION
   GET /api/v1/orders?page=1&limit=10
===================================================== */
export const getOrdersPaginated = async (req, res) => {
  try {
    const { page, limit } = getPagination(req);
    return buildResponse(res, {}, page, limit);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* =====================================================
   2. PAGED LISTING
   GET /api/v1/orders/paged
===================================================== */
export const getPagedOrders = async (req, res) => {
  try {
    const { page, limit } = getPagination(req);
    return buildResponse(res, {}, page, limit);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* =====================================================
   3. INFINITE SCROLL
   GET /api/v1/orders/infinite
===================================================== */
export const getInfiniteOrders = async (req, res) => {
  try {
    const { page, limit } = getPagination(req);

    const skip = (page - 1) * limit;

    const data = await Order.find({})
      .skip(skip)
      .limit(limit)
      .sort({ OrderDate: -1 });

    return res.json({
      success: true,
      nextPage: data.length ? page + 1 : null,
      data,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* =====================================================
   4. RECENT ORDERS
   GET /api/v1/orders/recent
===================================================== */
export const getRecentOrders = async (req, res) => {
  try {
    const { page, limit } = getPagination(req);

    const skip = (page - 1) * limit;

    const data = await Order.find({})
      .skip(skip)
      .limit(limit)
      .sort({ OrderDate: -1 });

    return res.json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* =====================================================
   5. CANCELLED ORDERS
===================================================== */
export const getCancelledOrders = async (req, res) => {
  try {
    const { page, limit } = getPagination(req);

    return buildResponse(
      res,
      { OrderStatus: "Cancelled" },
      page,
      limit
    );
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* =====================================================
   6. REFUNDED ORDERS
===================================================== */
export const getRefundedOrders = async (req, res) => {
  try {
    const { page, limit } = getPagination(req);

    return buildResponse(
      res,
      { OrderStatus: "Refunded" },
      page,
      limit
    );
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* =====================================================
   7. CUSTOMER ORDERS
===================================================== */
export const getCustomerOrders = async (req, res) => {
  try {
    const { page, limit } = getPagination(req);
    const customerId = req.params.customerId;

    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: "Customer ID missing",
      });
    }

    const query = {
      CustomerID: customerId.trim(), // IMPORTANT
    };

    return buildResponse(res, query, page, limit);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* =====================================================
   8. PRODUCT ORDERS
===================================================== */
export const getProductOrders = async (req, res) => {
  try {
    const { page, limit } = getPagination(req);

    return buildResponse(
      res,
      { ProductID: req.params.productId },
      page,
      limit
    );
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* =====================================================
   9. SEARCH PAGINATION
===================================================== */
export const getSearchPaginatedOrders = async (req, res) => {
  try {
    const { page, limit } = getPagination(req);
    const q = req.query.q || "";

    const regex = new RegExp(q, "i");

    const query = {
      $or: [
        { OrderID: regex },
        { CustomerName: regex },
        { ProductName: regex },
        { Category: regex },
        { Brand: regex },
        { City: regex },
      ],
    };

    return buildResponse(res, query, page, limit);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};