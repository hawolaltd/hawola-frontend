import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hook/useReduxTypes";
import {
  getLowStockProducts,
  getStockAlerts,
  updateStockLevel,
} from "@/redux/product/inventorySlice";
import { usePerformanceMonitor } from "@/util/performance";
import { toast } from "sonner";

const InventoryManagement = () => {
  usePerformanceMonitor("InventoryManagement");
  const dispatch = useAppDispatch();
  const { lowStockProducts, stockAlerts, isLoading } = useAppSelector(
    (state) => state.inventory
  );

  const [threshold, setThreshold] = useState(10);
  const [editingProduct, setEditingProduct] = useState<{
    id: number;
    quantity: number;
  } | null>(null);

  useEffect(() => {
    dispatch(getLowStockProducts(threshold));
    dispatch(getStockAlerts());
  }, [dispatch, threshold]);

  const handleUpdateStock = async (productId: number, newQuantity: number) => {
    try {
      await dispatch(
        updateStockLevel({ productId, quantity: newQuantity })
      ).unwrap();
      toast.success("Stock level updated successfully");
      setEditingProduct(null);
      // Refresh the data
      dispatch(getLowStockProducts(threshold));
      dispatch(getStockAlerts());
    } catch (error) {
      toast.error("Failed to update stock level");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Inventory Management</h1>
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">
            Low Stock Threshold:
          </label>
          <input
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="w-20 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            min="1"
          />
        </div>
      </div>

      {/* Stock Alerts */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Stock Alerts</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stockAlerts.map((alert: any) => (
            <div key={alert.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{alert.productName}</h3>
                  <p className="text-sm text-gray-600">SKU: {alert.sku}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    alert.currentStock <= 0
                      ? "bg-red-100 text-red-800"
                      : alert.currentStock < alert.threshold
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {alert.currentStock} in stock
                </span>
              </div>
              <div className="mt-4">
                <button
                  onClick={() =>
                    setEditingProduct({
                      id: alert.productId,
                      quantity: alert.currentStock,
                    })
                  }
                  className="text-primary hover:text-primary-dark text-sm font-medium"
                >
                  Update Stock
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Low Stock Products */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Low Stock Products</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Threshold
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {lowStockProducts.map((product: any) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={product.image}
                          alt={product.name}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.sku}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {editingProduct?.id === product.id ? (
                      <input
                        type="number"
                        value={editingProduct.quantity}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            quantity: Number(e.target.value),
                          })
                        }
                        className="w-20 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                        min="0"
                      />
                    ) : (
                      product.currentStock
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.threshold}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        product.currentStock <= 0
                          ? "bg-red-100 text-red-800"
                          : product.currentStock < product.threshold
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {product.currentStock <= 0
                        ? "Out of Stock"
                        : product.currentStock < product.threshold
                        ? "Low Stock"
                        : "In Stock"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {editingProduct?.id === product.id ? (
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() =>
                            handleUpdateStock(
                              product.id,
                              editingProduct.quantity
                            )
                          }
                          className="text-green-600 hover:text-green-900"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingProduct(null)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() =>
                          setEditingProduct({
                            id: product.id,
                            quantity: product.currentStock,
                          })
                        }
                        className="text-primary hover:text-primary-dark"
                      >
                        Update
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryManagement;
