var firebaseConfig = {
	    apiKey: "AIzaSyBBdqKLIw0duGu79sYIvLWJxQtvcPZO5C0",
    authDomain: "smartlamp-automation.firebaseapp.com",
    databaseURL: "https://smartlamp-automation-default-rtdb.firebaseio.com",
    projectId: "smartlamp-automation",
    storageBucket: "smartlamp-automation.appspot.com",
    messagingSenderId: "537806196824",
    appId: "1:537806196824:web:bb18fa178f2186645a3a2d"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// function signIn() {
// 	var email = document.getElementById('email').value;
// 	var password = document.getElementById('password').value;

// 	// cek user udah ad ke blm
// 	firebase.auth().fetchSignInMethodsForEmail(email)
// 		.then(function (signInMethods) {
// 		if (signInMethods.length === 0) {
// 			// klo nda ad user brarti ke register
// 			return firebase.auth().createUserWithEmailAndPassword(email, password);
// 		} else {
// 			// klo usernye udh ad brarti jadi login
// 			return firebase.auth().signInWithEmailAndPassword(email, password);
// 		}
// 		})
// 		.then(function (userCredential) {
// 		var user = userCredential.user;
// 		console.log(user);
// 		window.location.href = 'index.html';
// 		})
// 		.catch(function (error) {
// 		console.error(error);
// 		var errorMessage = error.message;
// 		alert(errorMessage);
// 		});
// }

function signIn() {
  var email = document.getElementById('email').value;
  var password = document.getElementById('password').value;

  // cek user udah ad ke blm
  firebase.auth().fetchSignInMethodsForEmail(email)
    .then(function (signInMethods) {
      if (signInMethods.length === 0) {
        // Jika email belum terdaftar, tampilkan pesan menggunakan iziToast
        iziToast.error({
          title: 'Email Not Registered',
          message: 'This email is not registered. Please register using the form below.',
        });

        // Munculkan modal registrasi
        showRegistrationModal(email, password);
      } else {
        // Jika email sudah terdaftar, lakukan login biasa.
        return firebase.auth().signInWithEmailAndPassword(email, password);
      }
    })
    .then(function (userCredential) {
      if (userCredential && userCredential.user) {
        var user = userCredential.user;
        console.log(user);
      } else {
        // Tangani kasus ketika userCredential tidak terdefinisi atau tidak mengandung properti 'user'
        console.error("Error in userCredential:", userCredential);
      }

      // Hanya arahkan pengguna ke 'index.html' jika login berhasil
      if (userCredential && userCredential.user) {
        window.location.href = 'index.html';
      }
    })
    .catch(function (error) {
      console.error(error);
      var errorMessage = error.message;
      alert(errorMessage);
    });
}


function showRegistrationModal(email, password) {
  // Tampilkan modal registrasi
  $('#registrationModal').modal('show');

  // Set nilai email dan password di dalam modal (jika perlu)
  document.getElementById('registrationEmail').value = email;
  document.getElementById('registrationPassword').value = password;
}

// Fungsi untuk mendaftarkan pengguna setelah pengguna mengisi informasi tambahan
function registerUser() {
  var email = document.getElementById('registrationEmail').value;
  var password = document.getElementById('registrationPassword').value;
  
  // Dapatkan informasi tambahan dari formulir modal yang Anda butuhkan
//   var username = document.getElementById('username').value; // Contoh
  
  // Panggil createUserWithEmailAndPassword untuk membuat akun baru
  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(function (userCredential) {
      var user = userCredential.user;
      // Set informasi tambahan seperti nama pengguna di sini
      // ...
      console.log(user);
      
      // Tutup modal setelah selesai
      $('#registrationModal').modal('hide');
      
      // Arahkan pengguna ke 'index.html' setelah berhasil mendaftar
      window.location.href = 'index.html';
    })
    .catch(function (error) {
      console.error(error);
      var errorMessage = error.message;
      alert(errorMessage);
    });
}

function googleLogin() {
	var provider = new firebase.auth.GoogleAuthProvider();
	firebase.auth().signInWithPopup(provider)
	.then(function (user) {
		console.log(user)
		window.location.href = 'index.html';
	})
	.catch(function (error) {
		console.error(error)
		var errorMessage = error.message;
		alert(errorMessage);
	})
}

function logout() {
	firebase.auth().signOut()
	  .then(function() {
		// Sign-out successful.
		window.location.href = 'auth-login.html'; // Redirect to the login page
	  })
	  .catch(function(error) {
		// An error happened.
		console.error(error);
		alert('Logout failed. Please try again.');
	  });
  }
  