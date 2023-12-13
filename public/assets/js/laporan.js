$(document).ready(function(childSnapshot) {
	const config = {

		  apiKey: "AIzaSyBBdqKLIw0duGu79sYIvLWJxQtvcPZO5C0",
  authDomain: "smartlamp-automation.firebaseapp.com",
  databaseURL: "https://smartlamp-automation-default-rtdb.firebaseio.com",
  projectId: "smartlamp-automation",
  storageBucket: "smartlamp-automation.appspot.com",
  messagingSenderId: "537806196824",
  appId: "1:537806196824:web:bb18fa178f2186645a3a2d"
};    
firebase.initializeApp(config);

var filaEliminada;
  
  const iconoBorrar = '<svg class="bi bi-trash" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg>';

  const iconoEditar = '<svg class="bi bi-pencil-fill" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"> <path fill-rule="evenodd" d="M2.646 11.354a.5.5 0 0 1-.082.63l-1.5 1.5a.5.5 0 0 1-.707 0L.177 12.207a.5.5 0 0 1 0-.707l1.5-1.5a.5.5 0 0 1 .63-.082l1.646 1.646a.5.5 0 0 1 0 .708zm10.708-7.708L13.793 3.5a.5.5 0 0 0-.707 0L11 5.293l-1.646-1.647a.5.5 0 0 0-.708 0l-6 6a.5.5 0 0 0-.121.188l-1.5 3a.5.5 0 0 0 .647.647l3-1.5a.498.498 0 0 0 .188-.12l6-6a.5.5 0 0 0 0-.708zM12.5 4.793L13.707 6.5L9.5 10.707l-1.793-.893L12.5 4.793zm-3.5 3.5l1.793 1.793l-5.297 2.648l-1.646-1.646l2.648-5.297zm-2.81 6.148l2.5-5l5 5l-2.5 2.5l-5-5z"/></svg>'

  
  var db = firebase.database();
  var coleccionProductos = db.ref().child("Data");
  var dataSet = [];
  var table;

  // datatable fetch firebase Data
  $(document).ready(function() {
    table = $('#tablaProductos').DataTable({
    pageLength: 5,
	  responsive: true,
    lengthMenu: [[ 10, 20, 30, 40, -1], [ 10, 20, 30, 40, 'Semua']],
    data: dataSet,
    columnDefs:  [
		{
		  targets: 0,
		  data: null,
		  render: function(data, type, row, meta) {
			return meta.row + 1;
		  },
		},
		{
		targets: -1,
		  // render: function(data, type, full, meta) {
			// return '<button class="btn btn-danger btn-sm btn-delete">' + iconoBorrar + '</button>' +
			//   '<button class="btn btn-primary btn-sm btn-edit">' + iconoEditar + '</button>';
		  // },
		},
	  ],
  });
  })

  // train models
  $(document).ready(function () {
    $("#trainButton").click(function () {
        trainModels(); // Function to send the AJAX request
    });
});

function trainModels() {
    $.ajax({
        url: "https://smartlamp.up.railway.app/api/train",
        type: "POST",
        success: function(response) {
            if (response.success) {
                iziToast.success({
                    title: 'Success',
                    message: response.message,
                    position: 'topRight'
                });
                setTimeout(function() {
                  window.location.href = 'train.html'
                }, 3000);
                
            } else {
                iziToast.error({
                    title: 'Error',
                    message: 'Error: ' + response.message,
                    position: 'topRight'
                });
            }
        },
        error: function(xhr, status, error) {
            iziToast.error({
                title: 'Error',
                message: 'Error: ' + error,
                position: 'topRight'
            });
        }
    });
}
  
  coleccionProductos.on("child_added", function(datos) {        
    dataSet = [
      datos.key,
      datos.child("Tanggal").val(),
      datos.child("Waktu").val(),
      datos.child("kamar").val(),
      datos.child("kamar2").val(),
      datos.child("ruangtamu").val(),
	    datos.child("dapur").val(),
      datos.child("toilet").val(),
      datos.child("teras").val()
    ];

    table.rows.add([dataSet]).draw();
  });

  // Add event listener for delete buttons
  $('#tablaProductos tbody').on('click', '.btn-delete', function() {
    var row = $(this).closest('tr');
    var rowData = table.row(row).data();
    var key = rowData[0]; // Assuming the key is stored in the first column

    // Show confirmation dialog
    iziToast.question({
		timeout: false,
		close: false,
		overlay: true,
		displayMode: 'once',
		zindex: 999,
		title: 'Delete',
		message: 'Are you sure you want to delete this item?',
		position: 'center',
		buttons: [
		  ['<button><b>Yes</b></button>', function(instance, toast) {
			// Remove the data from Firebase
			coleccionProductos.child(key).remove()
			  .then(function() {
				// Remove the row from the DataTable
				table.row(row).remove().draw();
  
				// Show success notification
				iziToast.success({
				  title: 'Success',
				  message: 'Item deleted successfully!',
				  position: 'topRight'
				});
			  })
			  .catch(function(error) {
				console.log("Error removing data: " + error);
  
				// Show error notification
				iziToast.error({
				  title: 'Error',
				  message: 'Failed to delete item!',
				  position: 'topRight'
				});
			  });
  
			instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');
		  }, true],
		  ['<button>No</button>', function(instance, toast) {
			instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');
		  }]
		]
	  });
	});

// Create the edit modal dynamically
var editModal = $('<div class="modal fade" id="editModal" tabindex="-1" aria-labelledby="editModalLabel" aria-hidden="true">');
var modalDialog = $('<div class="modal-dialog modal-dialog-centered modal-lg">');
var modalContent = $('<div class="modal-content">');
var modalHeader = $('<div class="modal-header">');
var modalTitle = $('<h5 class="modal-title" id="editModalLabel">Edit Item</h5>');
var modalCloseButton = $('<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close">');
var modalBody = $('<div class="modal-body d-flex">');
var modalFooter = $('<div class="modal-footer">');
var closeButton = $('<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>');
var saveButton = $('<button type="button" class="btn btn-primary" id="saveButton">Save changes</button>');

// Create the form and form elements
var form = $('<form class="d-flex flex-wrap">');
var formGroup1 = $('<div class="form-group">');
var formLabel1 = $('<label for="inputTanggal">Tanggal</label>');
var formInput1 = $('<input type="text" class="form-control" id="inputTanggal" name="inputTanggal">');
var formGroup2 = $('<div class="form-group">');
var formLabel2 = $('<label for="inputWaktu">Waktu</label>');
var formInput2 = $('<input type="time" class="form-control" id="inputWaktu" name="inputWaktu" step="1">');
var formGroup3 = $('<div class="form-group">');
var formLabel3 = $('<label for="inputKamar">Kamar</label>');
var formInput3 = $('<input type="text" class="form-control" id="inputKamar" name="inputKamar">');
var formGroup4 = $('<div class="form-group">');
var formLabel4 = $('<label for="inputKamar2">Kamar Kedua</label>');
var formInput4 = $('<input type="text" class="form-control" id="inputKamar2" name="inputKamar2">');
var formGroup5 = $('<div class="form-group">');
var formLabel5 = $('<label for="inputRuangTamu">Ruang Tamu</label>');
var formInput5 = $('<input type="text" class="form-control" id="inputRuangTamu" name="inputRuangTamu">');
var formGroup6 = $('<div class="form-group">');
var formLabel6 = $('<label for="inputDapur">Dapur</label>');
var formInput6 = $('<input type="text" class="form-control" id="inputDapur" name="inputDapur">');
var formGroup7 = $('<div class="form-group">');
var formLabel7 = $('<label for="inputToilet">Toilet</label>');
var formInput7 = $('<input type="text" class="form-control" id="inputToilet" name="inputToilet">');
var formGroup8 = $('<div class="form-group">');
var formLabel8 = $('<label for="inputTeras">Teras</label>');
var formInput8 = $('<input type="text" class="form-control" id="inputTeras" name="inputTeras">');

// Append form elements to form groups
formGroup1.append(formLabel1, formInput1);
formGroup2.append(formLabel2, formInput2);
formGroup3.append(formLabel3, formInput3);
formGroup4.append(formLabel4, formInput4);
formGroup5.append(formLabel5, formInput5);
formGroup6.append(formLabel6, formInput6);
formGroup7.append(formLabel7, formInput7);
formGroup8.append(formLabel8, formInput8);

// Append form groups to the form
form.append(formGroup1, formGroup2, formGroup3, formGroup4, formGroup5, formGroup6, formGroup7, formGroup8);

// Append form to the modal body
modalBody.append(form);

// Append elements to build the modal
modalHeader.append(modalTitle, modalCloseButton);
modalFooter.append(closeButton, saveButton);
modalContent.append(modalHeader, modalBody, modalFooter);
modalDialog.append(modalContent);
editModal.append(modalDialog);

// Append the edit modal to the body
$('body').append(editModal);

$('#tablaProductos tbody').on('click', '.btn-edit', function() {
  var row = $(this).closest('tr');
  var rowData = table.row(row).data();
  var key = rowData[0];

  // Retrieve data from Firebase for the selected key
  coleccionProductos.child(key).once('value', function(snapshot) {
    var data = snapshot.val();
    if (data) {
      // Populate the form fields with the retrieved data
      $('#inputTanggal').val(data.Tanggal);
      $('#inputWaktu').val(data.Waktu);
      $('#inputKamar').val(data.kamar);
      $('#inputKamar2').val(data.kamar2);
      $('#inputRuangTamu').val(data.ruangtamu);
      $('#inputDapur').val(data.dapur);
      $('#inputToilet').val(data.toilet);
      $('#inputTeras').val(data.teras);
    }
  });

  // Store the key in a variable accessible within the save button click event
  var saveKey = key;

  // Show the edit modal
  $('#editModal').modal('show');

  // Add event listeners for form field changes
$('#inputTanggal, #inputWaktu, #inputKamar, #inputKamar2, #inputRuangTamu, #inputDapur, #inputToilet, #inputTeras').on('change', function() {
	// Handle the change event for form fields
	var tanggal = $('#inputTanggal').val();
	var waktu = $('#inputWaktu').val();
	var kamar = $('#inputKamar').val();
	var kamar2 = $('#inputKamar2').val();
	var ruangTamu = $('#inputRuangTamu').val();
	var dapur = $('#inputDapur').val();
	var toilet = $('#inputToilet').val();
	var teras = $('#inputTeras').val();
  
	// Perform your desired actions or function calls based on the changed values
	console.log('Tanggal changed:', tanggal);
	console.log('Waktu changed:', waktu);
	console.log('Kamar changed:', kamar);
	console.log('Kamar2 changed:', kamar2);
	console.log('RuangTamu changed:', ruangTamu);
	console.log('Dapur changed:', dapur);
	console.log('Toilet changed:', toilet);
	console.log('Teras changed:', teras);
  });
  
  
  // Add event listener for save button
  $('#saveButton').on('click', function() {
    // Get the edited values from the form fields
    var editedData = {
      Tanggal: $('#inputTanggal').val(),
      Waktu: $('#inputWaktu').val(),
      kamar: $('#inputKamar').val(),
      kamar2: $('#inputKamar2').val(),
      ruangtamu: $('#inputRuangTamu').val(),
      dapur: $('#inputDapur').val(),
      toilet: $('#inputToilet').val(),
      teras: $('#inputTeras').val(),
    };

    // Update the data in Firebase using the stored key
    coleccionProductos.child(saveKey).update(editedData)
      .then(function() {
        // Update the corresponding row in the DataTable with the new values
      table.row(row).data(editedData).draw();

      // Delay before refreshing the browser
      setTimeout(function() {
        location.reload();
      }, 1500);
    })

        // Show success notification
        iziToast.success({
          title: 'Success',
          message: 'Item updated successfully!',
          position: 'topRight',
        });

        // Hide the edit modal
        $('#editModal').modal('hide');
      })
      .catch(function(error) {
        console.log("Error updating data: " + error);

        // Show error notification
        iziToast.error({
          title: 'Error',
          message: 'Failed to update item!',
          position: 'topRight',
        });
      });
  });
});



