import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";

// Add SDKs for Firebase products that you want to use
import { Firestore, 
        getFirestore, 
        onSnapshot, 
        query, 
        collection, 
        orderBy,
        addDoc,
        deleteDoc,
        doc,
        updateDoc,
        Timestamp } from 'https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js'

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBEjrhdBtVNfLo23JERckF9mpOBZ7fFBMk",
    authDomain: "cs048-2504685-task2.firebaseapp.com",
    projectId: "cs048-2504685-task2",
    storageBucket: "cs048-2504685-task2.firebasestorage.app",
    messagingSenderId: "268712875335",
    appId: "1:268712875335:web:089c52f48e4d8557fde862"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);	

//Add Document 
$('#addButton').click(async function() {

    const movieName = $('#movieName').val();
    const rating = parseInt($('#rating').val());
    const director = $('#director').val();
    const releaseDate = $('#releaseDate').val();

    // Validation
    if (movieName == '' || director == '' || releaseDate == '') {
        alert("Please complete all fields");
        return;
    }

    if (rating < 0 || rating > 5 || isNaN(rating)) {
        alert("Rating must be between 0 and 5");
        return;
    }

    // Convert HTML date -> Firestore Timestamp
    const dateObject = new Date(releaseDate);


    // Add to Firestore
    await addDoc(collection(db, "movies"), {
        movieName: movieName,
        rating: rating,
        director: director,
        releaseDate: Timestamp.fromDate(dateObject)
    });


    // Clear form
    $('#movieName').val('');
    $('#rating').val('');
    $('#director').val('');
    $('#releaseDate').val('');

});

function loadMovies() {
    // Get a live data snapshot (i.e. auto-refresh) of our Reviews collection
    const sortField = $('#sortField').val();
    const q = query(collection(db, "movies"), orderBy(sortField));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {

    // Empty HTML table
    $('#reviewList').empty();
        
    // Loop through snapshot data and add to HTML table
    let tableRows = '';
    snapshot.forEach((doc) => {
        tableRows += '<tr>';
        tableRows += '<td>'  + doc.data().movieName + '</td>'; 
        tableRows += '<td>'  + doc.data().rating + '/5</td>';
        tableRows += '<td>'  + doc.data().director + '</td>';
        tableRows += '<td>' + doc.data().releaseDate.toDate().toLocaleDateString() + '</td>';
        tableRows += '<td><button class="btn btn-outline-warning editBtn" data-id="' + doc.id + '">Edit</button></td>';
        tableRows += '<td><button class="btn btn-outline-danger deleteBtn" data-id="' + doc.id + '">Delete</button></td>';
        tableRows += '</tr>';	  
    });

    $('#reviewList').append(tableRows);
        
    // Display review count
    $('#mainTitle').html(snapshot.size + " movies in your collection");
    });	
}

//Update Functionality
$(document).on('click', '.editBtn', async function() {

    const documentId = $(this).data('id');

    // Get current row data
    const row = $(this).closest('tr');
    const currentMovie = row.find('td:eq(0)').text();
    const currentRating = row.find('td:eq(1)').text().replace('/5', '');
    const currentDirector = row.find('td:eq(2)').text();
    const currentDate = '';


    // Prompt user for updates
    const newMovie = prompt("Edit movie name:", currentMovie);
    const newRating = prompt("Edit rating:", currentRating);
    const newDirector = prompt("Edit director:", currentDirector);
    const newDate = prompt("Edit release date (YYYY-MM-DD):", currentDate);


    // Validation
    if (newMovie == null || newDirector == null || newDate == null) {
        return;
    }

    // Convert to Firestore timestamp
    const dateObject = new Date(newDate);

    //validation
    if (isNaN(newRating) || newRating < 0 || newRating > 5) {
        alert("Rating must be between 0 and 5");
        return;
    }
    // Update Firestore
    await updateDoc(doc(db, "movies", documentId), {
        movieName: newMovie,
        rating: Number(newRating),
        director: newDirector,
        releaseDate: Timestamp.fromDate(dateObject)
    });
});

//Delete Document
$(document).on('click', '.deleteBtn', async function() {
    const documentId = $(this).data('id');
    await deleteDoc(doc(db, "movies", documentId));
});

loadMovies();

$('#sortField').change(function () {
    loadMovies();
});