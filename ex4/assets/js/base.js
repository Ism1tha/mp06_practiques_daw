/**
 * Exercici 4 - CalculatorAPI / INS Montsià MP06
 * Author: Ismael Semmar Galvez
 *
 */
/* Constants */

const STATUS_DRAFT = 1;
const STATUS_SENT = 2;
const STATUS_PAID = 3;

/* Variables */

var invoices = [];

var invoicesTable = null;

/* Application Functions */

function loadApplication() {
  initializeInvoicesTable();
}

function initializeInvoicesTable() {
  if (invoicesTable) {
    invoicesTable.destroy();
  }
  invoicesTable = $("#invoices-table").DataTable({
    data: invoices,
    columns: [
      { data: "id", title: "ID" },
      { 
        data: "status", 
        title: "Status", 
        render: function (data, type, row) {
          return `<span class="${getStatusColor(data)}">${statusToText(data)}</span>`; 
        } 
      },
      { data: "date", title: "Date" },
      { data: "customer.name", title: "Customer" },
      {
        data: "items",
        title: "Items",
        render: function (data) {
          return data.length + " item(s)";
        },
      },
      {
        data: "items",
        title: "Total",
        render: function (data) {
          return calculateInvoiceTotal(data) + " USD";
        },
      },
      {
        data: null,
        title: "Actions",
        render: function (data, type, row, meta) {
          return `
            <button onclick="editInvoice(${row.id})" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 4 rounded">
              Edit
            </button> 
            <button onclick="deleteInvoice(${row.id})" class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ml-2">
              Delete
            </button> 
            <select onchange="updateInvoiceStatus(${row.id}, this.value)" class="border border-gray-400 rounded px-4 py-2 ml-2">
              <option value="${STATUS_DRAFT}" ${row.status === STATUS_DRAFT ? 'selected' : ''}>Draft</option>
              <option value="${STATUS_SENT}" ${row.status === STATUS_SENT ? 'selected' : ''}>Sent</option>
              <option value="${STATUS_PAID}" ${row.status === STATUS_PAID ? 'selected' : ''}>Paid</option>
            </select>`;
        },
      },
    ],
    language: {
      search: "",
      searchPlaceholder: "Search...",
    },
  });
}

function statusToText(status) {
  return status === STATUS_DRAFT ? "Draft" : status === STATUS_SENT ? "Sent" : "Paid";
}

function calculateInvoiceTotal(items) {
  return items.reduce((sum, item) => sum + parseFloat(item.quantity) * parseFloat(item.rate), 0).toFixed(2);
}

function setupItemsTable(itemsData = []) {
  $('#items-table').DataTable({
    destroy: true,
    data: itemsData,
    dom: 't',
    columns: [
      {
        data: 'name',
        title: 'Name',
        render: function (data, type, row, meta) {
          return `<input type="text" value="${data}" onchange="updateItem(${meta.row}, 'name', this.value)" class="w-full p-1 border rounded" />`;
        }
      },
      {
        data: 'quantity',
        title: 'Quantity',
        render: function (data, type, row, meta) {
          return `<input type="number" value="${data}" onchange="updateItem(${meta.row}, 'quantity', this.value)" class="w-full p-1 border rounded" />`;
        }
      },
      {
        data: 'rate',
        title: 'Rate',
        render: function (data, type, row, meta) {
          return `<input type="number" value="${data}" onchange="updateItem(${meta.row}, 'rate', this.value)" class="w-full p-1 border rounded" />`;
        }
      },
      {
        data: null,
        title: 'Total',
        render: function (data, type, row) {
          return (parseFloat(row.quantity) * parseFloat(row.rate)).toFixed(2);
        }
      },
      {
        data: null,
        title: 'Actions',
        render: function () {
          return '<button onclick="removeItem(this)" class="bg-red-500 text-white px-2 py-1 rounded">Remove</button>';
        }
      }
    ]
  });
}

function updateItem(rowIndex, field, value) {
  const itemsTable = $('#items-table').DataTable();
  const rowData = itemsTable.row(rowIndex).data();
  rowData[field] = field === 'quantity' || field === 'rate' ? parseFloat(value) : value;
  itemsTable.row(rowIndex).data(rowData).draw();

  itemsTable.cell(rowIndex, 3).data((rowData.quantity * rowData.rate).toFixed(2)).draw();

  const invoiceId = parseInt(document.getElementById('invoiceNo').value, 10);
  updateInvoiceTotalInMainTable(invoiceId);
}

function updateInvoiceTotalInMainTable(invoiceId) {
  const invoiceIndex = invoices.findIndex(inv => inv.id === invoiceId);
  if (invoiceIndex !== -1) {
    const newTotal = calculateInvoiceTotal(invoices[invoiceIndex].items); 

    invoicesTable.cell(invoiceIndex, 5).data(newTotal + " USD").draw();
  }
}

function addItem() {
  const itemsTable = $('#items-table').DataTable();
  const newItem = { name: 'New Item', quantity: 1, rate: 0 };
  itemsTable.row.add(newItem).draw();
}

function removeItem(button, rowIndex) {
  const row = $(button).closest('tr');
  const table = $('#items-table').DataTable();
  table.row(row).remove().draw();

  const invoiceId = parseInt(document.getElementById('invoiceNo').value, 10);
  updateInvoiceTotalInMainTable(invoiceId);
}

function openModal() {
  document.getElementById('invoiceModal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('invoiceModal').classList.add('hidden');
}

function saveInvoice(event) {
  event.preventDefault();
  const invoiceId = parseInt(document.getElementById('invoiceNo').value, 10);
  const customer = document.getElementById('customer').value;
  const address = document.getElementById('address').value;
  const city = document.getElementById('city').value;
  const date = document.getElementById('invoiceDate').value;   


  const itemsTable = $('#items-table').DataTable();
  const items = itemsTable.rows().data().toArray();

  const invoiceIndex = invoices.findIndex(inv => inv.id === invoiceId);

  if (invoiceIndex !== -1) {
    invoices[invoiceIndex] = {
      id: invoiceId,
      status: invoices[invoiceIndex].status,
      date: date,
      customer: {
        name: customer,
        address: address,
        city: city,
      },
      items: items
    };
  } else {
    const newInvoice = {
      id: invoices.length + 1,
      status: 1,
      date: date,
      customer: {
        name: customer,
        address: address,
        city: city,
      },
      items
    };
    invoices.push(newInvoice);
  }

  closeModal();
  initializeInvoicesTable();
}

function newInvoice() {
  document.getElementById('invoiceForm').reset();
  setupItemsTable();
  openModal();
}

function editInvoice(invoiceId) {
  const invoice = invoices.find(inv => inv.id === invoiceId);
  if (invoice) {
    document.getElementById('customer').value = invoice.customer.name;
    document.getElementById('address').value = invoice.customer.address;
    document.getElementById('city').value = invoice.customer.city;
    document.getElementById('invoiceDate').value = invoice.date;
    document.getElementById('invoiceNo').value = invoice.id;
    setupItemsTable(invoice.items);
    openModal();
  }
}

function deleteInvoice(invoiceId) {
  invoices = invoices.filter(invoice => invoice.id !== invoiceId);
  initializeInvoicesTable();
}

function updateInvoiceStatus(invoiceId, newStatus) {
  const invoiceIndex = invoices.findIndex(inv => inv.id === invoiceId);
  if (invoiceIndex !== -1) {
    invoices[invoiceIndex].status = parseInt(newStatus, 10);
    initializeInvoicesTable();
  }
}

function getStatusColor(status) {
  switch (status) {
    case STATUS_DRAFT:
      return "text-gray-500";
    case STATUS_SENT:
      return "text-blue-500";
    case STATUS_PAID:
      return "text-green-500";
    default:
      return "";
  }
}

document.addEventListener('DOMContentLoaded', function () {
  loadApplication();
});