import Order from "../models/order.model.js";

/**
 * =========================================
 * 1. QUERY PARAM SORTING
 * =========================================
 */
export const getSortedOrders = async (req, res) => {
  try {
    const { sort } = req.query;

    const sortMap = {
      amount: { TotalAmount: 1 },
      "-amount": { TotalAmount: -1 },

      date: { OrderDate: 1 },
      "-date": { OrderDate: -1 },

      status: { OrderStatus: 1 },

      customer: { CustomerName: 1 },
      city: { City: 1 },

      payment: { PaymentMethod: 1 },

      discount: { Discount: -1 },

      // optional improvements
      quantity: { Quantity: 1 },
      "-quantity": { Quantity: -1 },
    };

    const sortCondition = sortMap[sort] || { OrderDate: -1 };

    const orders = await Order.find().sort(sortCondition);

    res.status(200).json({
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

/**
 * =========================================
 * 2. SPECIAL SORT ROUTES
 * =========================================
 */
export const getSpecialSortedOrders = async (req, res) => {
  try {
    const { type } = req.params;

    let sortStage = {};

    switch (type) {
      case "highest-value":
        sortStage = { TotalAmount: -1 };
        break;

      case "lowest-value":
        sortStage = { TotalAmount: 1 };
        break;

      case "latest":
        sortStage = { OrderDate: -1 };
        break;

      case "oldest":
        sortStage = { OrderDate: 1 };
        break;

      case "discount":
        sortStage = { Discount: -1 };
        break;

      case "most-items":
        sortStage = { Quantity: -1 };
        break;

      case "least-items":
        sortStage = { Quantity: 1 };
        break;

      default:
        sortStage = { OrderDate: -1 };
    }

    const orders = await Order.aggregate([
      {
        $addFields: {
          QuantityNum: { $toInt: "$Quantity" },
          TotalAmountNum: { $toDouble: "$TotalAmount" },
          DiscountNum: { $toDouble: "$Discount" },
        },
      },
      {
        $sort: sortStage,
      },
    ]);

    res.status(200).json({
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