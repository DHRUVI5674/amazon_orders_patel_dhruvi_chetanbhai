import Order from "../models/order.model.js";

/**
 * GET /api/v1/orders
 * Fetch all orders (pagination ready)
 */
export const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const orders = await Order.find().lean().skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 });

    const total = await Order.countDocuments();

    res.json({
      success: true,
      page,
      totalPages: Math.ceil(total / limit),
      data: orders,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/v1/orders/:orderId
 */
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ OrderID: req.params.orderId }).lean();
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/v1/orders
 */
export const createOrder = async (req, res) => {
  try {
    console.log("REQ BODY:", req.body);

    const newOrder = await Order.create(req.body);

    console.log("CREATED ORDER:", newOrder);

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: newOrder,
    });
  } catch (err) {
    console.error("ERROR:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * PUT /api/v1/orders/:orderId
 * Replace full document
 */
export const replaceOrder = async (req, res) => {
  try {
    const order = await Order.findOneAndReplace(
      { OrderID: req.params.orderId },
      req.body,
      { returnDocument: 'after' }
    );

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PATCH /api/v1/orders/:orderId
 */
export const updateOrder = async (req, res) => {
  try {
    console.log("Params:", req.params);
    console.log("Body:", req.body);

    const order = await Order.findOneAndUpdate(
      { OrderID: req.params.orderId },
      { $set: req.body },
      { returnDocument: 'after', runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * DELETE /api/v1/orders/:orderId
 */
export const deleteOrder = async (req, res) => {
  try {
    await Order.findOneAndDelete({ OrderID: req.params.orderId });

    res.json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/v1/orders/:orderId/exists
 */
export const checkOrderExists = async (req, res) => {
  try {
    const exists = await Order.exists({ OrderID: req.params.orderId });

    res.json({
      success: true,
      exists: !!exists,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/v1/orders/:orderId/summary
 */
export const getOrderSummary = async (req, res) => {
  try {
    const order = await Order.findOne({ OrderID: req.params.orderId }).select(
      "OrderID CustomerName TotalAmount OrderStatus PaymentMethod"
    );

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/v1/orders/:orderId/items
 */
export const getOrderItems = async (req, res) => {
  try {
    const order = await Order.findOne({ OrderID: req.params.orderId }).select(
      "ProductID ProductName Quantity UnitPrice"
    );

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/v1/orders/:orderId/history
 * (basic mock history since dataset doesn't include it)
 */
export const getOrderHistory = async (req, res) => {
  try {
    const order = await Order.findOne({ OrderID: req.params.orderId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const baseDate = order?.OrderDate ? new Date(order.OrderDate) : new Date();

    const productName =
      order.ProductName ||
      order?.Product?.name ||
      "Unknown Product";

    const history = [
      {
        status: "Placed",
        date: baseDate,
        productName,
      },
      {
        status: order.OrderStatus || "Processing",
        date: new Date(),
        productName,
      },
    ];

    res.json({
      success: true,
      data: history,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * PATCH /api/v1/orders/:orderId/archive
 */
export const archiveOrder = async (req, res) => {
  try {
    const updatedOrder = await Order.findOneAndUpdate(
      { OrderID: req.params.orderId },
      { $set: { isArchived: true } },
      {
        returnDocument: "after",
        runValidators: true
      }
    );

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      data: updatedOrder,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * PATCH /api/v1/orders/:orderId/restore
 */
export const restoreOrder = async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      { OrderID: req.params.orderId },
      { $set: { isArchived: false } },
      {
        returnDocument: "after",
        runValidators: true
      }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.json({
      success: true,
      message: "Order restored successfully",
      data: order,
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
/**
 * POST /api/v1/orders/:orderId/cancel
 */
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      { OrderID: req.params.orderId },
      { $set: { OrderStatus: "Cancelled" } },
      { returnDocument: 'after' }
    );

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/v1/orders/:orderId/duplicate
 */
export const duplicateOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ OrderID: req.params.orderId });

    const copy = { ...order._doc };
    delete copy._id;

    copy.OrderID = `COPY-${order.OrderID}`;

    const newOrder = await Order.create(copy);

    res.json({ success: true, data: newOrder });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/v1/orders/:orderId/invoice
 */
export const getInvoice = async (req, res) => {
  try {
    const order = await Order.findOne({ OrderID: req.params.orderId });

    const invoice = {
      invoiceId: `INV-${order.OrderID}`,
      customer: order.CustomerName,
      items: {
        product: order.ProductName,
        quantity: order.Quantity,
        unitPrice: order.UnitPrice,
      },
      total: order.TotalAmount,
      paymentMethod: order.PaymentMethod,
      status: order.OrderStatus,
    };

    res.json({ success: true, data: invoice });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};