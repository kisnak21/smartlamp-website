var firebaseConfig = {
	apiKey: 'AIzaSyBBdqKLIw0duGu79sYIvLWJxQtvcPZO5C0',
	authDomain: 'smartlamp-automation.firebaseapp.com',
	databaseURL: 'https://smartlamp-automation-default-rtdb.firebaseio.com',
	projectId: 'smartlamp-automation',
	storageBucket: 'smartlamp-automation.appspot.com',
	messagingSenderId: '537806196824',
	appId: '1:537806196824:web:bb18fa178f2186645a3a2d',
}
// Initialize Firebase
firebase.initializeApp(firebaseConfig)

//   kamar utama
;(function () {
	firebase
		.database()
		.ref('kontrol')
		.child('kamar')
		.on('value', function (data) {
			var status = data.val()
			if (status == 'hidup') {
				$('#statuslampu_kamar').text('ON')
				document.getElementById('statuslampu_kamar')
			} else {
				$('#statuslampu_kamar').text('OFF')
				document.getElementById('statuslampu_kamar')
			}
		})
})()

//   kamar kedua
;(function () {
	firebase
		.database()
		.ref('kontrol')
		.child('kamar2')
		.on('value', function (data) {
			var status = data.val()
			if (status == 'hidup') {
				$('#statuslampu_kamar2').text('ON')
				document.getElementById('statuslampu_kamar2')
			} else {
				$('#statuslampu_kamar2').text('OFF')
				document.getElementById('statuslampu_kamar2')
			}
		})
})()

//   ruang tamu
;(function () {
	firebase
		.database()
		.ref('kontrol')
		.child('ruangtamu')
		.on('value', function (data) {
			var status = data.val()
			if (status == 'hidup') {
				$('#statuslampu_ruangtamu').text('ON')
				document.getElementById('statuslampu_ruangtamu')
			} else {
				$('#statuslampu_ruangtamu').text('OFF')
				document.getElementById('statuslampu_ruangtamu')
			}
		})
})()

//   dapur
;(function () {
	firebase
		.database()
		.ref('kontrol')
		.child('dapur')
		.on('value', function (data) {
			var status = data.val()
			if (status == 'hidup') {
				$('#statuslampu_dapur').text('ON')
				document.getElementById('statuslampu_dapur')
			} else {
				$('#statuslampu_dapur').text('OFF')
				document.getElementById('statuslampu_dapur')
			}
		})
})()

//   toilet
;(function () {
	firebase
		.database()
		.ref('kontrol')
		.child('toilet')
		.on('value', function (data) {
			var status = data.val()
			if (status == 'hidup') {
				$('#statuslampu_toilet').text('ON')
				document.getElementById('statuslampu_toilet')
			} else {
				$('#statuslampu_toilet').text('OFF')
				document.getElementById('statuslampu_toilet')
			}
		})
})()

//   teras
;(function () {
	firebase
		.database()
		.ref('kontrol')
		.child('teras')
		.on('value', function (data) {
			var status = data.val()
			if (status == 'hidup') {
				$('#statuslampu_teras').text('ON')
				document.getElementById('statuslampu_teras')
			} else {
				$('#statuslampu_teras').text('OFF')
				document.getElementById('statuslampu_teras')
			}
		})
})()

function getApi() {
	const endpoint = 'https://smartlamp.up.railway.app/api/result'
	// const endpoint = 'http://localhost:5000/api/result'

	$.ajax({
		url: endpoint,
		type: 'GET',
		dataType: 'json',
		success: function (data) {
			$('#kamar-accuracy').text(data['result']['kamar']['accuracy'])
			$('#kamar-precision').text(data['result']['kamar']['precision_avg'])
			$('#kamar-recall').text(data['result']['kamar']['recall_avg'])

			$('#kamar2-accuracy').text(data['result']['kamar2']['accuracy'])
			$('#kamar2-recall').text(data['result']['kamar2']['recall_avg'])
			$('#kamar2-precision').text(data['result']['kamar2']['precision_avg'])

			$('#ruangtamu-accuracy').text(data['result']['ruangtamu']['accuracy'])
			$('#ruangtamu-recall').text(data['result']['ruangtamu']['recall_avg'])
			$('#ruangtamu-precision').text(
				data['result']['ruangtamu']['precision_avg']
			)

			$('#teras-accuracy').text(data['result']['teras']['accuracy'])
			$('#teras-recall').text(data['result']['teras']['recall_avg'])
			$('#teras-precision').text(data['result']['teras']['precision_avg'])

			$('#toilet-accuracy').text(data['result']['toilet']['accuracy'])
			$('#toilet-recall').text(data['result']['toilet']['recall_avg'])
			$('#toilet-precision').text(data['result']['toilet']['precision_avg'])

			$('#dapur-accuracy').text(data['result']['dapur']['accuracy'])
			$('#dapur-recall').text(data['result']['dapur']['recall_avg'])
			$('#dapur-precision').text(data['result']['dapur']['precision_avg'])
		},
		error: function (error) {
			console.error('Error:', error)
		},
	})
}

function getEvaluasi() {
	const endpoint = 'https://smartlamp.up.railway.app/api/evaluasi'
	// const endpoint = 'http://localhost:5000/api/result'

	$.ajax({
		url: endpoint,
		type: 'GET',
		dataType: 'json',
		success: function (data) {
			$('#akurasi').text(data['accuracy'])
			$('#recall').text(data['recall'])
			$('#presisi').text(data['precision'])
			$('#missclassification').text(data['missclasify'])
		},
		error: function (error) {
			console.error('Error:', error)
		},
	})
}

$(document).ready(function () {
	getApi()
	getEvaluasi()
})

function getDatalatih() {
	// Gantilah dengan referensi Firebase Anda
	var firebaseRef = firebase.database().ref('/data_latih')

	// Gunakan metode .once() untuk mengambil data sekali
	firebaseRef
		.once('value')
		.then(function (snapshot) {
			// Mendapatkan jumlah data dari snapshot
			var dataCount = snapshot.numChildren()

			// Memasukkan jumlah data ke dalam elemen HTML
			document.getElementById('data_latih').textContent = dataCount + ' data'
		})
		.catch(function (error) {
			console.error(error)
		})
}

window.addEventListener('load', function () {
	getDatalatih()
})

function getDatauji() {
	// Gantilah dengan referensi Firebase Anda
	var firebaseRef = firebase.database().ref('/Pengujian')

	// Gunakan metode .once() untuk mengambil data sekali
	firebaseRef
		.once('value')
		.then(function (snapshot) {
			// Mendapatkan jumlah data dari snapshot
			var dataCount = snapshot.numChildren()

			// Memasukkan jumlah data ke dalam elemen HTML
			document.getElementById('data_uji').textContent = dataCount + ' data'
		})
		.catch(function (error) {
			console.error(error)
		})
}

window.addEventListener('load', function () {
	getDatauji()
})
