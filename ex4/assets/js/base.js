/**
 * Exercici 3 - Pokedex amb API / INS Montsià MP06
 * Author: Ismael Semmar Galvez
 *
 */

/* Constants */

/* Variables */

var showingInvoice = false;

var invoices = [
  {
    id: 1,
    status:  1,
    date: "2021-12-01",
    dueDate: "2021-12-31",
    customer: {
      name: "John Doe",
      address: "123 Main St",
      city: "Springfield",
    },
    items: [
      {
        description: "Widget",
        quantity: 2,
        price: 10.0,
      },
      {
        description: "Thing",
        quantity: 3,
        price: 15.0,
      },
    ],
  }
]

/* Application Functions */

function statusToText(status) {
  switch (status) {
    case 1:
      return "Draft";
    case 2:
      return "Sent";
    case 3:
      return "Paid";
    default:
      return "Unknown";
  }
}

/* Data Storage Functions */

/* UX Functions */

function setupInvoicesTable() { //DataTable.js 
  var table = $('#invoices-table').DataTable({
    data: invoices,
    columns: [
      { data: 'id' },
      { data: 'status', render: statusToText },
      { data: 'date' },
      { data: 'dueDate' },
      { data: 'customer.name' },
      {
        data: null,
        render: function (data, type, row) {
          return `<button class="block mx-auto px-4 py-2 rounded bg-blue-400 text-white flex items-center" onclick="showInvoice(${row.id})"><svg class="inline w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6"> <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /> </svg>Edit invoice</button>`;
        }
      }
    ]
  });
}

function openModal() {
  document.getElementById('invoiceModal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('invoiceModal').classList.add('hidden');
}

function updateDateTime() {
  const now = new Date();
  document.getElementById('date').textContent = now.toLocaleDateString();
  document.getElementById('time').textContent = now.toLocaleTimeString();
}

/* Set timeout, to simulate a delay 3 seconds */

document.addEventListener("DOMContentLoaded", function () {
  setupInvoicesTable();
  setInterval(updateDateTime, 1000);
});