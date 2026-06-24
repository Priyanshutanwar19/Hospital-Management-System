const Invoice = require("../models/Invoice");
const apiResponse = require("../utils/apiResponse");

const getInvoices = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.patientId) filter.patientId = req.query.patientId;
    if (req.query.appointmentId) filter.appointmentId = req.query.appointmentId;
    const invoices = await Invoice.find(filter);
    res.json(apiResponse({ success: true, message: "Invoices retrieved", data: invoices }));
  } catch (error) {
    next(error);
  }
};

const getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json(apiResponse({ success: false, message: "Invoice not found" }));
    res.json(apiResponse({ success: true, message: "Invoice retrieved", data: invoice }));
  } catch (error) {
    next(error);
  }
};

const createInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.create(req.body);
    res.status(201).json(apiResponse({ success: true, message: "Invoice created", data: invoice }));
  } catch (error) {
    next(error);
  }
};

const updateInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!invoice) return res.status(404).json(apiResponse({ success: false, message: "Invoice not found" }));
    res.json(apiResponse({ success: true, message: "Invoice updated", data: invoice }));
  } catch (error) {
    next(error);
  }
};

module.exports = { getInvoices, getInvoiceById, createInvoice, updateInvoice };
