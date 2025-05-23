import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hook/useReduxTypes";
import {
  getFAQs,
  submitSupportTicket,
  getReturnRequests,
  submitReturnRequest,
} from "@/redux/product/customerServiceSlice";
import { usePerformanceMonitor } from "@/util/performance";
import { toast } from "sonner";

// Sample FAQs data
const sampleFAQs = [
  {
    id: 1,
    question: "What is your return policy?",
    answer:
      "We offer a 30-day return policy for most items. Products must be unused and in their original packaging. Custom or personalized items may have different return conditions.",
  },
  {
    id: 2,
    question: "How long does shipping take?",
    answer:
      "Standard shipping typically takes 3-5 business days within the continental US. International shipping may take 7-14 business days depending on the destination.",
  },
  {
    id: 3,
    question: "Do you offer international shipping?",
    answer:
      "Yes, we ship to most countries worldwide. Shipping costs and delivery times vary by location. You can check shipping rates during checkout.",
  },
  {
    id: 4,
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and Apple Pay. All payments are processed securely.",
  },
  {
    id: 5,
    question: "How can I track my order?",
    answer:
      "Once your order ships, you'll receive a tracking number via email. You can also track your order status by logging into your account and visiting the 'Order History' section.",
  },
  {
    id: 6,
    question: "What is your warranty policy?",
    answer:
      "Most products come with a 1-year manufacturer warranty. Extended warranty options are available for purchase at checkout for eligible items.",
  },
];

const CustomerServicePortal = () => {
  usePerformanceMonitor("CustomerServicePortal");
  const dispatch = useAppDispatch();
  const { faqs, tickets, returnRequests, isLoading } = useAppSelector(
    (state) => state.customerService
  );

  const [activeTab, setActiveTab] = useState("faq");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [supportTicket, setSupportTicket] = useState({
    subject: "",
    message: "",
    priority: "medium",
  });
  const [returnRequest, setReturnRequest] = useState({
    orderId: "",
    reason: "",
    description: "",
  });

  useEffect(() => {
    dispatch(getFAQs());
    dispatch(getReturnRequests());
  }, [dispatch]);

  const handleSupportTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(submitSupportTicket(supportTicket)).unwrap();
      toast.success("Support ticket submitted successfully");
      setSupportTicket({ subject: "", message: "", priority: "medium" });
    } catch (error) {
      toast.error("Failed to submit support ticket");
    }
  };

  const handleReturnRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(submitReturnRequest(returnRequest)).unwrap();
      toast.success("Return request submitted successfully");
      setReturnRequest({ orderId: "", reason: "", description: "" });
    } catch (error) {
      toast.error("Failed to submit return request");
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
      <h1 className="text-2xl font-bold mb-6">Customer Service Portal</h1>

      {/* Navigation Tabs */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab("faq")}
          className={`px-4 py-2 rounded-lg ${
            activeTab === "faq" ? "bg-primary text-white" : "bg-gray-100"
          }`}
        >
          FAQs
        </button>
        <button
          onClick={() => setActiveTab("support")}
          className={`px-4 py-2 rounded-lg ${
            activeTab === "support" ? "bg-primary text-white" : "bg-gray-100"
          }`}
        >
          Support Tickets
        </button>
        <button
          onClick={() => setActiveTab("returns")}
          className={`px-4 py-2 rounded-lg ${
            activeTab === "returns" ? "bg-primary text-white" : "bg-gray-100"
          }`}
        >
          Returns
        </button>
      </div>

      {/* FAQ Section */}
      {activeTab === "faq" && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            Frequently Asked Questions
          </h2>
          <div className="space-y-2">
            {sampleFAQs.map((faq) => (
              <div key={faq.id} className="border rounded-lg overflow-hidden">
                <button
                  className="w-full px-4 py-3 text-left flex justify-between items-center hover:bg-gray-50 focus:outline-none"
                  onClick={() =>
                    setExpandedFaq(expandedFaq === faq.id ? null : faq.id)
                  }
                >
                  <h3 className="font-medium">{faq.question}</h3>
                  <svg
                    className={`w-5 h-5 transform transition-transform ${
                      expandedFaq === faq.id ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                <div
                  className={`px-4 transition-all duration-200 ease-in-out ${
                    expandedFaq === faq.id
                      ? "max-h-96 opacity-100 py-3"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Support Tickets Section */}
      {activeTab === "support" && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6">
              Submit a Support Ticket
            </h2>
            <form onSubmit={handleSupportTicketSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={supportTicket.subject}
                    onChange={(e) =>
                      setSupportTicket({
                        ...supportTicket,
                        subject: e.target.value,
                      })
                    }
                    placeholder="Brief description of your issue"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority Level
                  </label>
                  <select
                    value={supportTicket.priority}
                    onChange={(e) =>
                      setSupportTicket({
                        ...supportTicket,
                        priority: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  >
                    <option value="low">Low - General Inquiry</option>
                    <option value="medium">Medium - Technical Issue</option>
                    <option value="high">High - Urgent Problem</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={supportTicket.message}
                  onChange={(e) =>
                    setSupportTicket({
                      ...supportTicket,
                      message: e.target.value,
                    })
                  }
                  placeholder="Please provide detailed information about your issue..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition-colors min-h-[150px]"
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>

          {/* Existing Tickets */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6">Your Support Tickets</h2>
            <div className="space-y-4">
              {tickets.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No support tickets found.</p>
                </div>
              ) : (
                tickets.map((ticket: any) => (
                  <div
                    key={ticket.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium text-lg">
                            {ticket.subject}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              ticket.status === "open"
                                ? "bg-green-100 text-green-800"
                                : ticket.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {ticket.status.charAt(0).toUpperCase() +
                              ticket.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-gray-600 line-clamp-2">
                          {ticket.message}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          {ticket.priority.charAt(0).toUpperCase() +
                            ticket.priority.slice(1)}{" "}
                          Priority
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Returns Section */}
      {activeTab === "returns" && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-primary to-primary-dark rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-8 text-white">
              Submit a Return Request
            </h2>
            <form onSubmit={handleReturnRequestSubmit} className="space-y-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Order ID
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-white/70">
                        #
                      </span>
                      <input
                        type="text"
                        value={returnRequest.orderId}
                        onChange={(e) =>
                          setReturnRequest({
                            ...returnRequest,
                            orderId: e.target.value,
                          })
                        }
                        placeholder="Enter your order number"
                        className="w-full pl-8 pr-4 py-3 rounded-lg bg-white/20 border-2 border-white/30 text-white placeholder-white/70 focus:border-white focus:ring-2 focus:ring-white/30 transition-colors"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Reason for Return
                    </label>
                    <select
                      value={returnRequest.reason}
                      onChange={(e) =>
                        setReturnRequest({
                          ...returnRequest,
                          reason: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-lg bg-white/20 border-2 border-white/30 text-white focus:border-white focus:ring-2 focus:ring-white/30 transition-colors"
                      required
                    >
                      <option value="" className="bg-primary-dark">
                        Select a reason
                      </option>
                      <option value="wrong_item" className="bg-primary-dark">
                        Wrong Item Received
                      </option>
                      <option value="damaged" className="bg-primary-dark">
                        Item Damaged
                      </option>
                      <option value="quality" className="bg-primary-dark">
                        Quality Issues
                      </option>
                      <option value="size" className="bg-primary-dark">
                        Wrong Size
                      </option>
                      <option value="other" className="bg-primary-dark">
                        Other
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <label className="block text-sm font-semibold text-white mb-2">
                  Description
                </label>
                <textarea
                  value={returnRequest.description}
                  onChange={(e) =>
                    setReturnRequest({
                      ...returnRequest,
                      description: e.target.value,
                    })
                  }
                  placeholder="Please provide detailed information about your return request..."
                  className="w-full px-4 py-3 rounded-lg bg-white/20 border-2 border-white/30 text-white placeholder-white/70 focus:border-white focus:ring-2 focus:ring-white/30 transition-colors min-h-[150px]"
                  required
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-white text-primary px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 font-medium shadow-lg hover:shadow-xl"
                >
                  Submit Return Request
                </button>
              </div>
            </form>
          </div>

          {/* Existing Return Requests */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-8 text-gray-900">
              Your Return Requests
            </h2>
            <div className="space-y-6">
              {returnRequests.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <svg
                    className="w-12 h-12 mx-auto text-primary mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                  <p className="text-gray-600 font-medium">
                    No return requests found
                  </p>
                </div>
              ) : (
                returnRequests.map((request: any) => (
                  <div
                    key={request.id}
                    className="bg-white rounded-lg p-6 hover:shadow-md transition-all border border-gray-100"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-4">
                          <div className="bg-primary p-2 rounded-lg text-white">
                            <svg
                              className="w-6 h-6"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                              />
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-gray-900">
                              Order #{request.orderId}
                            </h3>
                            <p className="text-primary font-medium capitalize">
                              {request.reason.replace("_", " ")}
                            </p>
                          </div>
                        </div>
                        <p className="text-gray-600 line-clamp-2">
                          {request.description}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-3">
                        <span
                          className={`px-4 py-2 rounded-full text-sm font-semibold ${
                            request.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : request.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {request.status.charAt(0).toUpperCase() +
                            request.status.slice(1)}
                        </span>
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          {new Date(request.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerServicePortal;
