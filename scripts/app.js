const firebaseConfig = {
  apiKey: "AIzaSyBHNOY40EyvdcIRQTJwNLdXGstXBPduuWI",
  authDomain: "photo-gallery-app-4097f.firebaseapp.com",
  projectId: "photo-gallery-app-4097f",
  storageBucket: "photo-gallery-app-4097f.firebasestorage.app",
  messagingSenderId: "769771220620",
  appId: "1:769771220620:web:925cc1f8d5a870d5b315a9",
  measurementId: "G-MVTKW8JW29"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Signup
const signupForm = document.getElementById('signupForm');
if (signupForm) {
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const contact = document.getElementById('signupContact').value;
    const password = document.getElementById('signupPassword').value;

    auth.createUserWithEmailAndPassword(email, password).then(cred => {
      return db.collection('users').doc(cred.user.uid).set({
        name, email, contact
      });
    }).then(() => {
      alert("Signup successful");
      window.location.href = "index.html";
    }).catch(err => alert(err.message));
  });
}

// Login
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    auth.signInWithEmailAndPassword(email, password)
      .then(() => {
        alert("Login successful");
        window.location.href = "index.html";
      })
      .catch(err => alert(err.message));
  });
}

// Profile management
auth.onAuthStateChanged(user => {
  if (user) {
    const uid = user.uid;
    const userDoc = db.collection('users').doc(uid);

    userDoc.get().then(doc => {
      if (doc.exists) {
        const data = doc.data();
        const nameEl = document.getElementById('profileName');
        const emailEl = document.getElementById('profileEmail');
        const contactEl = document.getElementById('profileContact');

        if (nameEl) nameEl.innerText = data.name;
        if (emailEl) emailEl.innerText = data.email;
        if (contactEl) contactEl.innerText = data.contact;
      }
    });

    const updateForm = document.getElementById('updateProfileForm');
    if (updateForm) {
      updateForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newName = document.getElementById('updateName').value;
        const newContact = document.getElementById('updateContact').value;
        userDoc.update({ name: newName, contact: newContact })
          .then(() => alert("Profile updated"));
      });
    }

    const deleteBtn = document.getElementById('deleteProfileBtn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        userDoc.delete().then(() => {
          user.delete().then(() => alert("Profile deleted"));
        });
      });
    }
  }
});

// Photo upload
function uploadPhoto() {
  const file = document.getElementById('photoFile').files[0];
  if (!file) return alert("Please select a file.");

  const user = auth.currentUser;
  if (!user) return alert("Please login first.");

  const ref = storage.ref(`photos/${user.uid}/${file.name}`);
  ref.put(file).then(() => alert("Photo uploaded"));
}

// Display photos
const photosDiv = document.getElementById('photos');
if (photosDiv) {
  auth.onAuthStateChanged(user => {
    if (user) {
      const ref = storage.ref(`photos/${user.uid}`);
      ref.listAll().then(res => {
        res.items.forEach(item => {
          item.getDownloadURL().then(url => {
            const img = document.createElement('img');
            img.src = url;
            photosDiv.appendChild(img);
          });
        });
      });
    }
  });
}
